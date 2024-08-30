import os
from flask import Blueprint, request, jsonify, send_file, current_app
from werkzeug.utils import secure_filename
import pandas as pd
from models import db
from utils.db_helpers import create_table_from_files, fetch_table_data, ensure_columns_exist, update_student_record,parse_error_message,assign_grade_levels
from sqlalchemy import inspect, MetaData, Table, Column, String, text
from utils.files_utils import FilesHandler  # 导入 Handler 工具类
from utils.common_utils import order_data_by_columns  # 导入 CSVHandler 工具类

# 定义一个 Flask Blueprint，用于组织路由和视图函数
main_bp = Blueprint('main', __name__)

# 定义允许的文件扩展名
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}


def allowed_file(filename):
    """
    检查上传的文件是否为允许的类型（例如 .csv 文件）
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS





@main_bp.route('/upload', methods=['POST'])
def upload_file():
    """
    处理文件上传的主函数
    接受文件，创建或替换相应的数据库表，并插入数据
    """
    if 'student_performance_data' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['student_performance_data']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = file.filename
        check_filename = os.path.splitext(filename)[0]

        # 检查文件名是否合法
        valid_filename, error_message = FilesHandler.validate_filename(check_filename)
        if not valid_filename:
            return jsonify({"error": error_message}), 400

        # 将连字符替换为下划线，使用文件名（去掉扩展名）作为数据库表名
        table_name = FilesHandler.clean_table_name(check_filename)

        try:
            # 读取上传的文件内容，并转换为 Pandas DataFrame
            if filename.endswith('.csv'):
                df = pd.read_csv(file)
            elif filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file)

            # 确保列名是字符串
            df.columns = [str(col) for col in df.columns]

            columns = df.columns.tolist()  # 获取文件的表头（列名）

            # 清理列名，确保没有空格，大写转小写
            cleaned_columns, clean_messages = FilesHandler.clean_column_names(columns)
            df.columns = cleaned_columns  # 更新 DataFrame 的列名

            # 使用 SQLAlchemy 的 inspect 工具检查表是否存在
            inspector = inspect(db.engine)
            if inspector.has_table(table_name):
                # 如果表存在，手动删除表
                metadata = MetaData()
                table = Table(table_name, metadata, autoload_with=db.engine)
                table.drop(db.engine)

            # 使用自定义工具函数根据文件表头动态创建数据库表
            create_table_from_files(table_name, cleaned_columns, db.engine)

            # 将数据插入到新创建的数据库表中
            df.to_sql(table_name, db.engine, if_exists='append', index=False)

            # 确保表中存在 'grade_level' 和 'comments' 列
            ensure_columns_exist(table_name, {'grade_level': 'VARCHAR(255)', 'comments': 'VARCHAR(255)'}, db.engine)
            # 调用 assign_grade_levels 函数分配 grade_level
            assign_grade_levels(table_name, db.engine)
            # 从数据库中读取数据
            df_restored = pd.read_sql_table(table_name, db.engine)

            # 恢复列名的空格，注意这里会保持列的顺序不变
            restored_columns = FilesHandler.restore_column_names(df_restored.columns.tolist())
            df_restored.columns = restored_columns  # 更新 DataFrame 的列名为恢复空格后的列名

            # 转换 DataFrame 为字典列表并返回
            data = df_restored.to_dict(orient='records')
            ordered_data = order_data_by_columns(restored_columns, data)

            # 修改：在返回给前端前还原表名
            restored_table_name = FilesHandler.restore_table_name(table_name)

            # 返回成功的 JSON 响应，包含表名、列名、插入的数据和警告信息
            return jsonify({
                "message": "File uploaded and data stored successfully",
                "table_name": restored_table_name,  # 使用还原后的表名
                "columns": restored_columns,  # 添加列名到响应中
                "data": ordered_data,
            }), 200

        except Exception as e:
            # 捕获所有异常并返回详细的错误信息
            error_message = str(e)
            detailed_error = parse_error_message(error_message)
            return jsonify(
                {"error": "An error occurred during the file upload process", "details": detailed_error}), 500

    return jsonify({"error": "File type not allowed"}), 400



@main_bp.route('/update_student', methods=['POST'])
def update_student():
    """
    根据前端传递的 filename 和 student_id 更新学生记录，并返回更新后的表数据
    """
    data = request.json  # 获取 JSON 格式的数据

    # 从请求数据中获取必要的字段
    filename = data.get('filename')
    id_number = data.get('id_number')
    grade_level = data.get('grade_level')
    comments = data.get('comments')

    if not filename or not id_number or grade_level is None or comments is None:
        return jsonify({"error": "Missing required parameters"}), 400

    # 使用文件名（去掉扩展名）作为数据库表名，并清理表名
    check_filename = os.path.splitext(filename)[0]
    table_name = FilesHandler.clean_table_name(check_filename)

    # 使用 SQLAlchemy 的 inspect 工具检查表是否存在
    inspector = inspect(db.engine)
    if not inspector.has_table(table_name):
        return jsonify({"error": "Table not found"}), 404

    metadata = MetaData()
    table = Table(table_name, metadata, autoload_with=db.engine)
    # 确保表中存在 'grade_level' 和 'comments' 列
    ensure_columns_exist(table_name, {'grade_level': 'VARCHAR(255)', 'comments': 'VARCHAR(255)'}, db.engine)

    # 更新表中指定 student_id 的记录
    update_student_record(table, id_number, grade_level, comments, db.engine)

    df_restored = pd.read_sql_table(table_name, db.engine)

    # 恢复列名的空格，注意这里会保持列的顺序不变
    restored_columns = FilesHandler.restore_column_names(df_restored.columns.tolist())
    df_restored.columns = restored_columns  # 更新 DataFrame 的列名为恢复空格后的列名

    # 转换 DataFrame 为字典列表并返回
    data = df_restored.to_dict(orient='records')
    ordered_data = order_data_by_columns(restored_columns, data)

    # 在返回给前端时，将表名中的下划线还原为连字符
    restored_table_name = FilesHandler.restore_table_name(table_name)

    # 返回成功的 JSON 响应，包含表名、列名、插入的数据和警告信息
    return jsonify({
        "message": "Student record updated successfully",
        "table_name": restored_table_name,  # 使用还原后的文件名
        "columns": restored_columns,  # 添加列名到响应中
        "data": ordered_data,
    }), 200



@main_bp.route('/list_csv', methods=['GET'])
def list_csv():
    """
    返回数据库中所有表的名称，并将下划线还原为连字符
    """
    inspector = inspect(db.engine)  # 使用 SQLAlchemy 的 inspect 工具来检查数据库
    tables = inspector.get_table_names()  # 获取所有表的名称

    # 新增：将表名中的下划线还原为连字符
    restored_tables = [FilesHandler.restore_table_name(table) for table in tables]

    return jsonify({"CSV files": restored_tables}), 200  # 将表名列表返回给前端



@main_bp.route('/export_csv', methods=['POST'])
def export_csv():
    """
    接收前端请求，指定从数据库提取哪个CSV文件，并生成新的CSV文件供前端下载
    """
    data = request.json

    # 检查请求中是否包含 'filename'
    if 'filename' not in data:
        return jsonify({"error": "No filename provided"}), 400

    filename = data['filename']
    check_filename = os.path.splitext(filename)[0]

    # 修改1: 使用清理后的表名作为数据库表名
    table_name = FilesHandler.clean_table_name(check_filename)

    # 从数据库中提取数据
    query = text(f"SELECT * FROM `{table_name}`")
    with db.engine.connect() as connection:
        result = connection.execute(query)
        data = [dict(row._mapping) for row in result]

    # 将数据转换为 DataFrame
    df = pd.DataFrame(data)

    # 恢复列名中的空格
    restored_columns = FilesHandler.restore_column_names(df.columns.tolist())
    df.columns = restored_columns  # 更新 DataFrame 的列名为恢复空格后的列名

    # 修改2: 强制将导出的文件扩展名设置为 '.csv'，并使用还原后的表名作为文件名
    restored_table_name = FilesHandler.restore_table_name(table_name)
    output_filename = os.path.join(current_app.config['UPLOAD_FOLDER'], restored_table_name + '.csv')

    # 将数据写入到新的 CSV 文件
    df.to_csv(output_filename, index=False, encoding='utf-8')

    # 提供下载该 CSV 文件
    return send_file(output_filename, as_attachment=True, download_name=restored_table_name + '.csv')


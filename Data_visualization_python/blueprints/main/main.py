import os
from flask import Blueprint, request, jsonify, send_file, current_app
from pandas.io.sql import table_exists
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.utils import secure_filename
import pandas as pd
from models import db
from utils.db_helpers import create_table_from_files, fetch_table_data, ensure_columns_exist, update_student_record, \
    parse_error_message, assign_grade_levels, insert_mapping, get_original_filename, create_mapping_table, \
    get_all_original_filenames, \
    create_column_mapping_table, generate_short_column_names, insert_column_mapping, get_max_column_order, \
    get_table_columns,get_table_data
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
    接受多个文件，创建或替换相应的数据库表，并插入数据
    """
    if 'student_performance_data' not in request.files:
        return jsonify({"error": "No file part"}), 400

    files = request.files.getlist('student_performance_data')

    if len(files) == 0:
        return jsonify({"error": "No selected file"}), 400

    responses = []

    # 在循环外确保映射表存在，避免每个文件重复检查和创建
    create_column_mapping_table(db.engine)
    create_mapping_table(db.engine)

    for file in files:
        if file.filename == '':
            responses.append({"filename": "", "status": "failed", "error": "No selected file"})
            continue

        if file and allowed_file(file.filename):
            original_filename = os.path.splitext(file.filename)[0]
            check_filename = os.path.splitext(original_filename)[0].lower()

            # 检查文件名是否合法
            valid_filename, error_message = FilesHandler.validate_filename(check_filename)
            if not valid_filename:
                responses.append({"filename": file.filename, "status": "failed", "error": error_message})
                continue

            # 将连字符替换为下划线，使用文件名（去掉扩展名）作为数据库表名
            table_name = FilesHandler.clean_table_name(check_filename)

            try:
                # 读取上传的文件内容，并转换为 Pandas DataFrame
                if file.filename.endswith('.csv'):
                    df = pd.read_csv(file)
                elif file.filename.endswith(('.xlsx', '.xls')):
                    df = pd.read_excel(file)

                # 确保列名是字符串
                df.columns = [str(col) for col in df.columns]

                columns = df.columns.tolist()  # 获取文件的表头（列名）

                short_columns = generate_short_column_names(columns)
                df.columns = short_columns

                # 使用 SQLAlchemy 的 inspect 工具检查表是否存在
                inspector = inspect(db.engine)
                if inspector.has_table(table_name):
                    # 如果表存在，手动删除表
                    metadata = MetaData()
                    table = Table(table_name, metadata, autoload_with=db.engine)
                    table.drop(db.engine)

                # 使用自定义工具函数根据文件表头动态创建数据库表
                create_table_from_files(table_name, short_columns, db.engine)

                # 将数据插入到新创建的数据库表中
                df.to_sql(table_name, db.engine, if_exists='append', index=False)

                # 将原始文件名与表名的映射关系插入到映射表中
                insert_mapping(original_filename, table_name, db.engine)

                # 调用列名映射函数，存储列名的映射关系
                insert_column_mapping(table_name, columns, short_columns, db.engine)

                # 获取当前表的最大column_order
                max_column_orders = get_max_column_order(db.engine)
                current_max_order = max_column_orders.get(table_name, 0)

                # 确保表中存在 'grade level' 和 'comments' 列，并传入当前的最大column_order
                ensure_columns_exist(table_name, {'grade level': 'VARCHAR(255)', 'comments': 'VARCHAR(255)'}, db.engine, current_max_order)
                # 分配成绩等级
                assign_grade_levels(table_name, db.engine)
                # 文件成功上传
                responses.append({"filename": file.filename, "status": "success"})

            except Exception as e:
                # 捕获所有异常并返回详细的错误信息
                error_message = str(e)
                responses.append({
                    "filename": file.filename,
                    "status": "failed",
                    "error": "An error occurred during the file upload process",
                    "details": error_message
                })
        else:
            responses.append({"filename": file.filename, "status": "failed", "error": "File type not allowed"})

    # 返回所有文件的处理结果，只包含文件名和状态
    return jsonify(responses), 200


@main_bp.route('/update_student', methods=['POST'])
def update_student():
    """
    根据前端传递的 filename 和 student_id 更新学生记录
    """
    data = request.json  # 获取 JSON 格式的数据

    # 从请求数据中获取必要的字段
    filename = data.get('filename')
    id_number = data.get('id_number')
    grade_level = data.get('grade_level')
    comments = data.get('comments')

    if not all([filename, id_number, grade_level is not None, comments is not None]):
        return jsonify({"error": "Missing required parameters"}), 400

    # 使用文件名（去掉扩展名）作为数据库表名，并清理表名
    table_name = FilesHandler.clean_table_name(filename.lower())

    # 检查表是否存在
    if not table_exists(table_name, db.engine):
        return jsonify({"error": "Table not found"}), 404

    # 获取表的列映射
    columns = get_table_columns(table_name, db.engine)

    # 找到 ID number, grade level 和 comments 对应的短列名
    id_number_col = next((col['short'] for col in columns if col['original'] == 'ID number'), None)
    grade_level_col = next((col['short'] for col in columns if col['original'].lower() == 'grade level'), None)
    comments_col = next((col['short'] for col in columns if col['original'].lower() == 'comments'), None)

    if not all([id_number_col, grade_level_col, comments_col]):
        return jsonify({"error": "Required columns not found in the table"}), 500

    # 更新表中指定 student_id 的记录
    update_success = update_student_record(table_name, id_number, grade_level, comments, db.engine,
                                           id_number_col, grade_level_col, comments_col)

    if not update_success:
        return jsonify({"error": "Failed to update the student record"}), 500

    return jsonify({
        "message": "Student record updated successfully",
        "id_number": id_number
    }), 200

@main_bp.route('/list_csv', methods=['GET'])
def list_csv():
    """
    从映射表中返回所有的原始文件名
    """
    try:
        # 调用 db_helpers.py 中的函数来获取原始文件名列表
        original_filenames = get_all_original_filenames(db.engine)
        return jsonify({"CSV files": original_filenames}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch CSV files: {str(e)}"}), 500

@main_bp.route('/export_csv', methods=['POST'])
def export_csv():
    """
       接受前端上传的 CSV 文件名，返回对应的数据库表内容
       """
    data = request.json
    filename = data.get('filename')

    if not filename:
        return jsonify({"error": "Filename is required"}), 400

    # 使用文件名（去掉扩展名）作为数据库表名，并清理表名
    table_name = FilesHandler.clean_table_name(filename.lower())

    if not table_exists(table_name, db.engine):
        return jsonify({"error": "Table not found"}), 404

    try:
        # 获取表的列映射
        columns = get_table_columns(table_name, db.engine)

        # 创建短列名到原始列名的映射
        column_mapping = {col['short']: col['original'] for col in columns}

        # 获取表数据
        data = get_table_data(table_name, db.engine,exclude_columns=["id"])

        # 将短列名替换为原始列名
        for row in data:
            for short_name, original_name in column_mapping.items():
                if short_name in row:
                    row[original_name] = row.pop(short_name)

        # 获取原始文件名（如果存在映射的话）
        original_filename = get_original_filename(table_name, db.engine)

        # 将数据转换为 DataFrame
        df = pd.DataFrame(data)

        # 恢复列名中的空格


        # 强制将导出的文件扩展名设置为 '.csv'，并使用还原后的表名作为文件名
        output_filename = os.path.join(current_app.config['UPLOAD_FOLDER'], original_filename + '.csv')

        # 将数据写入到新的 CSV 文件
        df.to_csv(output_filename, index=False, encoding='utf-8')

        # 提供下载该 CSV 文件
        return send_file(output_filename, as_attachment=True, download_name=original_filename + '.csv')

    except Exception as e:
        # 捕获所有异常并返回详细的错误信息
        error_message = str(e)
        detailed_error = parse_error_message(error_message)
        return jsonify(
            {"error": "An error occurred during the export process", "details": detailed_error}), 500


@main_bp.route('/get_table_data', methods=['POST'])
def get_table_data_route():
    """
    接受前端上传的 CSV 文件名，返回对应的数据库表内容
    """
    data = request.json
    filename = data.get('filename')

    if not filename:
        return jsonify({"error": "Filename is required"}), 400

    # 使用文件名（去掉扩展名）作为数据库表名，并清理表名
    table_name = FilesHandler.clean_table_name(filename.lower())

    if not table_exists(table_name, db.engine):
        return jsonify({"error": "Table not found"}), 404

    try:
        # 获取表的列映射
        columns = get_table_columns(table_name, db.engine)

        # 创建短列名到原始列名的映射
        column_mapping = {col['short']: col['original'] for col in columns}

        # 获取表数据
        data = get_table_data(table_name, db.engine,exclude_columns=["id"])

        # 将短列名替换为原始列名
        for row in data:
            for short_name, original_name in column_mapping.items():
                if short_name in row:
                    row[original_name] = row.pop(short_name)

        # 获取原始文件名（如果存在映射的话）
        original_filename = get_original_filename(table_name,db.engine)

        return jsonify({
            "table_name": original_filename,
            "columns": list(column_mapping.values()),
            "data": data
        }), 200


    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500
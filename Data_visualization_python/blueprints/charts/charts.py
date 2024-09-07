from flask import Blueprint, request, jsonify
from pandas.io.sql import table_exists
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

from models import db
from sqlalchemy.sql import text

from utils.charts_helpers import ChartDataHelper
from utils.files_utils import FilesHandler
from utils.db_helpers import get_original_filename, get_table_columns, get_columns_data

# 创建一个蓝图用于charts相关的路由
charts_bp = Blueprint('charts', __name__)


@charts_bp.route('/query_table_data', methods=['POST'])
def query_table_data():
    """
    接受前端上传的 CSV 文件名和要查询的列名，返回对应的数据库表内容
    列名可以是单个字符串或字符串列表
    """
    data = request.json
    filename = data.get('filename')
    requested_columns = data.get('columns')
    if not filename:
        return jsonify({'error': 'filename is incorrect'}), 400
    if not requested_columns:
        return jsonify({'error': 'columns is incorrect'}), 400
    # 使用文件名（去掉扩展名）作为数据库表名，并清理表名
    table_name = FilesHandler.clean_table_name(filename.lower())

    if not table_exists(table_name, db.engine):
        return jsonify({"error": "Table not found"}), 404

    try:
        # 处理输入：如果是单个字符串，转换为列表
        if isinstance(requested_columns, str):
            requested_columns = [requested_columns]

        # 获取表的列映射
        columns = get_table_columns(table_name, db.engine)

        # 创建原始列名到短列名的映射
        column_mapping = {col['original']: col['short'] for col in columns}

        # 找到请求的列名对应的短列名
        short_column_names = []
        for col in requested_columns:
            short_name = column_mapping.get(col)
            if short_name:
                short_column_names.append(short_name)
            else:
                # 如果找不到对应的短列名，可能是因为列名不存在，这里我们选择忽略它
                print(f"Warning: Column '{col}' not found in the table.")

        # 如果没有有效的列名，返回错误
        if not short_column_names:
            return jsonify({"error": "No valid columns specified"}), 400

        # 使用短列名查询数据
        result_data = get_columns_data(table_name, short_column_names, db.engine)

        # 将数据按列重新组织
        column_grouped_data = {}
        reverse_mapping = {v: k for k, v in column_mapping.items()}

        for short_name in short_column_names:
            original_name = reverse_mapping.get(short_name, short_name)
            column_grouped_data[original_name] = [row[short_name] for row in result_data]

        return jsonify({
            "table_name": filename,
            "data": column_grouped_data
        }), 200

    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@charts_bp.route('/grade_level_data', methods=['POST'])
def grade_level_data():
    """
    获取指定成绩等级的学生ID列表和grade total列。

    期望的JSON请求体格式：
    {
        "filename": "student_data_2023.csv",
        "grade_level": "A"
    }

    :return: JSON响应，包含学生ID和grade total的列表
    """
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    filename = data.get('filename')
    grade_level = data.get('grade level')

    # 检查必要的参数是否存在
    if not filename:
        return jsonify({"error": "filename is incorrect"}), 400
    if not grade_level:
        return jsonify({"error": "grade level is incorrect"}), 400

    # 使用文件名（去掉扩展名）作为数据库表名，并清理表名
    table_name = FilesHandler.clean_table_name(filename.lower())
    if not table_exists(table_name, db.engine):
        return jsonify({"error": "file not found"}), 404

    try:
        grade_column = 'grade level'
        id_column = 'ID number'
        paper_total_column = 'Paper total (Real)'
        # 获取表的列映射
        columns = get_table_columns(table_name, db.engine)
        # 创建原始列名到短列名的映射
        column_mapping = {col['original']: col['short'] for col in columns}

        short_name = column_mapping.get(grade_column)
        short_id = column_mapping.get(id_column)
        short_paper_total = column_mapping.get(paper_total_column)
        if not short_name:
            # 如果找不到对应的短列名
            return jsonify({"error": f"Warning: Column '{grade_column}' not found in the table."}), 404

        result = ChartDataHelper.get_grade_level_data(table_name, short_name, short_id, short_paper_total, grade_level)

        if result is None:
            return jsonify({"error": f"No data found for grade level: {grade_level}"}), 404

        # 将结果转换为所需的格式
        formatted_result = [
            {
                "ID number": item[0],
                "Paper total (Real)": item[1]
            }
            for item in result
        ]

        return jsonify({"data": formatted_result}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


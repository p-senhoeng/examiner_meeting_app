from flask import Blueprint, request, jsonify
from sqlalchemy import func
from models import db
from sqlalchemy.sql import text

# 创建一个蓝图用于charts相关的路由
charts_bp = Blueprint('charts', __name__)


@charts_bp.route('/barChart', methods=['POST'])
def bar_chart():
    """
    处理前端发送的请求，根据指定的表名查询数据库中的 grade_level 列，
    并统计每个等级的数量，最终将结果以字典的形式返回给前端。
    """
    data = request.json  # 从请求中获取 JSON 格式的数据

    # 从请求数据中获取表名
    table_name = data.get('table_name')

    # 如果没有提供表名，返回错误信息
    if not table_name:
        return jsonify({"error": "Table name is required"}), 400

    try:
        # 使用 text 构建一个 SQL 查询，统计每个 grade_level 的数量
        query = text(f"SELECT grade_level, COUNT(*) as count FROM `{table_name}` GROUP BY grade_level")

        # 连接到数据库并执行查询
        with db.engine.connect() as connection:
            result = connection.execute(query)  # 执行查询并获取结果

            # 将 result.keys() 转换为列表
            columns = list(result.keys())

            # 获取 grade_level 和 count 列在结果中的索引
            grade_level_idx = columns.index('grade_level')
            count_idx = columns.index('count')

            # 初始化一个空字典用于存储结果
            grade_counts = {}

            # 遍历查询结果，将每个等级及其对应的数量添加到字典中
            for row in result:
                grade_level = row[grade_level_idx]  # 使用索引获取 grade_level 的值
                count = row[count_idx]  # 使用索引获取 count 的值
                grade_counts[grade_level] = count  # 将结果添加到字典中

        # 返回成功响应，并将结果字典发送给前端
        return jsonify({
            "message": "Data retrieved successfully",
            "data": grade_counts
        }), 200

    except Exception as e:
        # 捕获任何异常，并返回包含错误信息的响应
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

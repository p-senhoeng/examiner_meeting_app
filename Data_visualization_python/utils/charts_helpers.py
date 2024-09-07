# utils/charts_helpers.py

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from models import db
from utils.db_helpers import get_table_columns


class ChartDataHelper:
    @staticmethod
    def get_grade_level_data(table_name, short_name, short_id, short_paper_total, grade_level):
        """
        获取指定成绩等级的学生ID和grade total。

        :param table_name: 数据库表名
        :param short_name: 成绩等级列名
        :param short_id: ID列名
        :param short_paper_total: 总分列名
        :param grade_level: 要查询的成绩等级
        :return: 包含每个学生ID和grade total的列表
        """

        query = text(f"""
            SELECT {short_id}, {short_paper_total}
            FROM {table_name}
            WHERE {short_name} = :grade_level
        """)

        with db.engine.connect() as connection:
            try:
                result = connection.execute(query, {"grade_level": grade_level})

                data = result.fetchall()

                if not data:
                    # 如果没有找到匹配的grade_level，返回None
                    return None

                # 将每个元组转换为列表，并将所有列表组合成一个大列表
                return [[str(row[0]), str(row[1])] for row in data]

            except SQLAlchemyError as e:
                print(f"Error occurred while fetching grade level data for table {table_name}: {e}")
                raise
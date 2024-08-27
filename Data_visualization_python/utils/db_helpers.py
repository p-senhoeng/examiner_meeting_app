# utils/db_helpers.py

from sqlalchemy import MetaData, Table, Column, Integer, String, inspect
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import text


def create_table_from_files(table_name, columns, db_engine):
    """
    根据文件的列名动态创建数据库表
    :param table_name: 数据库表的名称
    :param columns: 文件的列名列表
    :param db_engine: SQLAlchemy 数据库引擎
    :return: 创建的 Table 对象
    """
    metadata = MetaData()
    columns_def = [Column('id', Integer, primary_key=True, autoincrement=True)]

    for col in columns:
        columns_def.append(Column(col, String(255)))  # 这里默认将所有列设为 String 类型

    # 动态创建表
    table = Table(table_name, metadata, *columns_def, extend_existing=True)
    metadata.create_all(db_engine)  # 在数据库中创建表
    return table


from sqlalchemy import Table, MetaData

from sqlalchemy import Table, MetaData


def fetch_table_data(table_name, db_engine):
    """
    从指定的数据库表中获取所有数据并返回为字典列表格式
    :param table_name: 要查询的表名称
    :param db_engine: 数据库引擎
    :return: 包含表中所有数据的字典列表
    """
    metadata = MetaData()
    table = Table(table_name, metadata, autoload_with=db_engine)

    with db_engine.connect() as connection:
        query = table.select()
        result = connection.execute(query)
        data = [dict(row._mapping) for row in result]  # 使用 _mapping 来确保正确转换为字典

    return data


def ensure_columns_exist(table_name, columns, db_engine):
    """
    确保表中存在指定的列，如果不存在则添加
    :param table_name: 要操作的表名称
    :param columns: 需要确保存在的列及其类型，格式为字典 {'column_name': column_type}
    :param db_engine: 数据库引擎
    """
    inspector = inspect(db_engine)
    existing_columns = [col['name'] for col in inspector.get_columns(table_name)]
    print(f"Existing columns in table {table_name}: {existing_columns}")  # 打印现有列名

    with db_engine.connect() as connection:
        trans = connection.begin()  # 开始事务
        try:
            for column_name, column_type in columns.items():
                if column_name not in existing_columns:
                    sql = f'ALTER TABLE {table_name} ADD COLUMN `{column_name}` {column_type}'
                    print(f"Executing SQL: {sql}")  # 打印即将执行的 SQL 语句
                    connection.execute(text(sql))
            trans.commit()  # 提交事务
        except SQLAlchemyError as e:
            trans.rollback()  # 回滚事务
            print(f"Error occurred: {e}")
            raise


def update_student_record(table, id_number, grade_level, comments, db_engine):
    """
    更新学生记录的 grade_level 和 comments
    :param table: 表对象
    :param id_number: 学生的 ID
    :param grade_level: 等级
    :param comments: 评语
    :param db_engine: 数据库引擎
    """
    with db_engine.connect() as connection:
        trans = connection.begin()  # 开始事务
        try:
            # 打印列名和类型
            for column in table.columns:
                print(f"Column name: {column.name}, Type: {column.type}")

            # 先检查记录是否存在
            select_query = table.select().where(table.c['id_number'] == id_number)
            result = connection.execute(select_query).fetchone()

            if result:
                print("Record found:", result)
                # 如果记录存在，执行更新操作
                update_query = (
                    table.update()
                    .where(table.c['id_number'] == id_number)
                    .values({
                        table.c['grade_level']: grade_level,
                        table.c['comments']: comments
                    })
                )
                update_result = connection.execute(update_query)
                print(f"Rows affected: {update_result.rowcount}")

                trans.commit()  # 提交事务
                return update_result.rowcount > 0  # 返回是否成功更新
            else:
                print(f"No matching record found for id_number: {id_number}")
                trans.rollback()  # 回滚事务
                return False  # 返回未找到匹配记录
        except Exception as e:
            print(f"Error occurred: {e}")
            trans.rollback()  # 在发生异常时回滚事务
            raise


def parse_error_message(error_message):
    """
    解析错误信息，并返回更具象化的错误描述
    :param error_message: 原始的错误信息
    :return: 解析后的错误描述
    """
    if "Identifier name" in error_message:
        return "Some column names in the database are too long. Please shorten the column names and try again."
    elif "Table already exists" in error_message:
        return "The database table already exists. Please delete the table or use a new file name."
    elif "Duplicate entry" in error_message:
        return "Duplicate entries were found during data insertion. Please check if the data file contains duplicate records."
    else:
        return error_message  # 如果无法识别错误类型，则返回原始错误信息


def assign_grade_levels(table_name, db_engine):
    """
    根据 paper_total_(real) 列的分数区间，给每个学生的 grade_level 列分配等级。
    :param table_name: 数据库表的名称
    :param db_engine: SQLAlchemy 数据库引擎
    """
    # 定义分数区间对应的等级
    grade_mapping = {
        (90, 100): 'A+',
        (85, 89): 'A',
        (80, 84): 'A-',
        (75, 79): 'B+',
        (70, 74): 'B',
        (65, 69): 'B-',
        (60, 64): 'C+',
        (55, 59): 'C',
        (50, 54): 'C-',
        (40, 49): 'D',
        (0, 39): 'E'
    }

    with db_engine.connect() as connection:
        trans = connection.begin()  # 开始事务
        try:
            # 查询每个学生的 paper_total_(real) 分数
            select_query = text(f"SELECT id_number, `paper_total_(real)` FROM {table_name}")
            result = connection.execute(select_query)

            # 获取列名并转换为列表
            columns = list(result.keys())
            id_number_idx = columns.index('id_number')
            paper_total_idx = columns.index('paper_total_(real)')

            # 为每个学生分配等级
            for row in result:
                student_id = row[id_number_idx]  # 根据索引获取 id_number
                score = row[paper_total_idx]     # 根据索引获取 paper_total_(real)

                # 确保 score 是一个数字（例如整数或浮点数）
                try:
                    score = float(score)
                except ValueError:
                    print(f"Invalid score '{score}' for student ID '{student_id}'")
                    continue

                grade_level = None

                for range_tuple, grade in grade_mapping.items():
                    if range_tuple[0] <= score <= range_tuple[1]:
                        grade_level = grade
                        break

                if grade_level:
                    # 更新学生的 grade_level 列
                    update_query = text(f"UPDATE {table_name} SET grade_level = :grade_level WHERE id_number = :id_number")
                    connection.execute(update_query, {"grade_level": grade_level, "id_number": student_id})

            trans.commit()  # 提交事务
        except SQLAlchemyError as e:
            trans.rollback()  # 回滚事务
            print(f"Error occurred: {e}")
            raise




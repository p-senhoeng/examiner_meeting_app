# utils/db_helpers.py

from sqlalchemy import MetaData, Table, Column, Integer, String, inspect,bindparam
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


def ensure_columns_exist(table_name, columns, db_engine, max_column_order):
    """
    确保简化后的表中存在指定的列，如果不存在则添加。
    同时更新 table_columns_mapping 表中的列信息。

    :param table_name: 要操作的表名称
    :param columns: 需要确保存在的列及其类型，格式为字典 {'column_name': column_type}
    :param db_engine: 数据库引擎
    :param max_column_order: 当前表的最大column_order
    """
    print(f"Ensuring columns exist for table: {table_name}")  # 打印调试信息

    with db_engine.begin() as connection:
        try:
            # 获取表的现有列
            inspector = inspect(db_engine)
            existing_columns = {col['name']: col['type'] for col in inspector.get_columns(table_name)}
            print(f"Existing columns: {existing_columns}")

            new_columns = []
            new_short_columns = []

            # 遍历需要添加的列
            for column_name, column_type in columns.items():
                if column_name not in existing_columns:
                    # 生成新的简化列名
                    max_column_order += 1
                    short_column_name = f"col_{max_column_order}"

                    # 添加新列到表中，使用参数化SQL避免拼接
                    alter_table_query = text(f"""
                        ALTER TABLE {table_name} ADD COLUMN `{short_column_name}` {column_type}
                    """)
                    connection.execute(alter_table_query)
                    print(f"Added new column: {short_column_name} to table {table_name}")

                    new_columns.append(column_name)
                    new_short_columns.append(short_column_name)
                else:
                    print(f"Column {column_name} already exists in table {table_name}")

            # 如果有新列被添加，更新列名映射
            if new_columns:
                # 获取当前表的最大column_order
                max_column_order_query = text("""
                    SELECT MAX(column_order) as max_order
                    FROM table_columns_mapping
                    WHERE table_name = :table_name
                """)
                result = connection.execute(max_column_order_query, {"table_name": table_name})
                current_max_order = result.scalar() or 0

                # 插入新的列映射
                for index, (original_column, short_column) in enumerate(zip(new_columns, new_short_columns)):
                    insert_query = text(
                        "INSERT INTO table_columns_mapping (table_name, original_column_name, short_column_name, column_order) "
                        "VALUES (:table_name, :original_column_name, :short_column_name, :column_order)"
                    )
                    connection.execute(insert_query, {
                        "table_name": table_name,
                        "original_column_name": original_column,
                        "short_column_name": short_column,
                        "column_order": current_max_order + index + 1
                    })

            print(f"Ensured columns exist for table {table_name}")

        except SQLAlchemyError as e:
            print(f"Error occurred while ensuring columns exist: {e}")
            raise

def update_student_record(table_name, id_number, grade_level, comments, db_engine,
                          id_number_col, grade_level_col, comments_col):
    """
    更新学生记录的 grade_level 和 comments
    :param table_name: 表名
    :param id_number: 学生的 ID
    :param grade_level: 等级
    :param comments: 评语
    :param db_engine: 数据库引擎
    :param id_number_col: ID number 列的短名称
    :param grade_level_col: grade level 列的短名称
    :param comments_col: comments 列的短名称
    """
    with db_engine.begin() as connection:
        try:
            # 先检查记录是否存在
            select_query = text(f"SELECT * FROM {table_name} WHERE {id_number_col} = :id_number")
            result = connection.execute(select_query, {"id_number": id_number}).fetchone()

            if result:
                print("Record found:", result)
                # 如果记录存在，执行更新操作
                update_query = text(f"""
                    UPDATE {table_name}
                    SET {grade_level_col} = :grade_level, {comments_col} = :comments
                    WHERE {id_number_col} = :id_number
                """)
                update_result = connection.execute(update_query, {
                    "grade_level": grade_level,
                    "comments": comments,
                    "id_number": id_number
                })
                print(f"Rows affected: {update_result.rowcount}")

                return update_result.rowcount > 0  # 返回是否成功更新
            else:
                print(f"No matching record found for ID number: {id_number}")
                return False  # 返回未找到匹配记录
        except SQLAlchemyError as e:
            print(f"Error occurred: {e}")
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
        (85, 90): 'A',
        (80, 85): 'A-',
        (75, 80): 'B+',
        (70, 75): 'B',
        (65, 70): 'B-',
        (60, 65): 'C+',
        (55, 60): 'C',
        (50, 55): 'C-',
        (40, 50): 'D',
        (0, 40): 'E'
    }

    # 获取表的列映射
    columns = get_table_columns(table_name, db_engine)

    # 找到 id number 和 paper total (real) 对应的短列名
    id_number_col = next((col['short'] for col in columns if col['original'] == 'ID number'), None)
    paper_total_col = next((col['short'] for col in columns if col['original'] == 'Paper total (Real)'), None)
    grade_level_col = next((col['short'] for col in columns if col['original'] == 'grade level'), None)

    # 添加调试打印
    if not all([id_number_col, paper_total_col, grade_level_col]):
        raise ValueError(f"Required columns not found in the table. Found columns: {columns}")

    with db_engine.begin() as connection:
        try:
            # 查询每个学生的 paper_total_(real) 分数
            select_query = text(f"SELECT {id_number_col}, {paper_total_col} FROM {table_name}")
            result = connection.execute(select_query)

            # 获取列名
            column_names = result.keys()

            # 为每个学生分配等级
            for row in result:
                # 将行转换为字典
                row_dict = dict(zip(column_names, row))
                student_id = row_dict[id_number_col]
                score = row_dict[paper_total_col]

                # 确保 score 是一个数字（例如整数或浮点数）
                try:
                    score = float(score)
                except (ValueError, TypeError):
                    print(f"Invalid score '{score}' for student ID '{student_id}'")
                    continue

                grade_level = None

                for range_tuple, grade in grade_mapping.items():
                    if range_tuple[0] <= score <= range_tuple[1]:
                        grade_level = grade
                        break

                if grade_level:
                    # 更新学生的 grade_level 列
                    update_query = text(
                        f"UPDATE {table_name} SET {grade_level_col} = :grade_level WHERE {id_number_col} = :id_number")
                    connection.execute(update_query, {"grade_level": grade_level, "id_number": student_id})

            print(f"Grade levels assigned for table {table_name}")

        except SQLAlchemyError as e:
            print(f"Error occurred while assigning grade levels: {e}")
            raise





def create_mapping_table(db_engine):
    """
    创建文件名与表名的映射表，如果不存在的话。
    :param db_engine: SQLAlchemy 的数据库引擎
    """
    try:
        with db_engine.connect() as connection:
            trans = connection.begin()  # 开始事务
            try:
                # 使用 inspect 来检查表是否已经存在
                inspector = inspect(connection)
                if not inspector.has_table('file_name_mapping'):

                    # 使用手动 SQL 创建表
                    create_table_query = """
                    CREATE TABLE file_name_mapping (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        original_filename VARCHAR(255) NOT NULL,
                        table_name VARCHAR(255) NOT NULL,
                        upload_time VARCHAR(255) NOT NULL
                    );
                    """
                    connection.execute(text(create_table_query))


                trans.commit()  # 提交事务

            except SQLAlchemyError as e:
                print(f"Error occurred during transaction: {e}")
                trans.rollback()  # 在发生异常时回滚事务
                raise

    except SQLAlchemyError as e:
        print(f"Error occurred during connection: {e}")
        raise

def insert_mapping(original_filename, table_name, db_engine):
    """
    插入文件名和表名的映射关系。
    :param original_filename: 上传的原始文件名
    :param table_name: 在数据库中存储的表名
    :param db_engine: 数据库引擎
    """
    with db_engine.connect() as connection:
        trans = connection.begin()  # 开启事务
        try:
            # 检查是否存在仅大小写不同的原始文件名
            check_query = text("SELECT original_filename FROM file_name_mapping WHERE LOWER(original_filename) = LOWER(:original_filename)")
            result = connection.execute(check_query, {"original_filename": original_filename}).fetchone()

            if result:
                # 如果存在仅大小写不同的原始文件名，抛出异常
                raise ValueError(f"A file with the same name or same name with different capitalization already exists in the database: {result[0]}")

            # 插入新的映射关系
            insert_query = text(
                "INSERT INTO file_name_mapping (original_filename, table_name, upload_time) "
                "VALUES (:original_filename, :table_name, NOW())"
            )
            connection.execute(insert_query, {"original_filename": original_filename, "table_name": table_name})
            trans.commit()  # 提交事务

        except (SQLAlchemyError, ValueError) as e:
            trans.rollback()  # 回滚事务
            print(f"Error occurred while inserting mapping: {e}")
            raise





def get_original_filename(table_name, db_engine):
    """
    根据表名获取原始文件名。
    :param table_name: 数据库表名
    :param db_engine: 数据库引擎
    :return: 原始文件名
    """
    with db_engine.connect() as connection:
        try:
            select_query = text("SELECT original_filename FROM file_name_mapping WHERE table_name = :table_name")
            result = connection.execute(select_query, {"table_name": table_name}).fetchone()
            return result[0] if result else None  # 使用索引访问元组中的数据
        except SQLAlchemyError as e:
            print(f"Error occurred while fetching original filename: {e}")
            raise

def get_all_original_filenames(db_engine):
    """
    从 file_name_mapping 表中获取所有原始文件名。
    :param db_engine: 数据库引擎
    :return: 原始文件名列表
    """
    with db_engine.connect() as connection:
        try:
            select_query = text("SELECT original_filename FROM file_name_mapping")
            result = connection.execute(select_query).fetchall()
            original_filenames = [row[0] for row in result]
            return original_filenames
        except SQLAlchemyError as e:
            print(f"Error occurred while fetching original filenames: {e}")
            raise


def create_column_mapping_table(db_engine):
    """
    创建一个存储表头信息的映射表，包含表名和列名的对应关系。
    :param db_engine: SQLAlchemy 的数据库引擎
    """
    try:
        with db_engine.connect() as connection:
            trans = connection.begin()  # 开始事务
            try:
                # 使用 inspect 来检查表是否已经存在
                inspector = inspect(connection)
                if not inspector.has_table('table_columns_mapping'):

                    # 使用手动 SQL 创建表
                    create_table_query = """
                    CREATE TABLE table_columns_mapping (id INT AUTO_INCREMENT PRIMARY KEY,
                        table_name VARCHAR(255) NOT NULL,
                        original_column_name VARCHAR(255) NOT NULL,
                        short_column_name VARCHAR(255) NOT NULL,
                        column_order INT NOT NULL
                    );
                    """
                    connection.execute(text(create_table_query))


                trans.commit()  # 提交事务

            except SQLAlchemyError as e:
                print(f"Error occurred during transaction: {e}")
                trans.rollback()  # 在发生异常时回滚事务
                raise

    except SQLAlchemyError as e:
        print(f"Error occurred during connection: {e}")
        raise


def generate_short_column_names(columns):
    """
    生成列名的简写形式
    :param columns: 原始列名列表
    :return: 简写列名列表
    """
    short_columns = []
    for i, col in enumerate(columns):
        short_column = f"col_{i+1}"  # 简写列名为 col_1, col_2, ...
        short_columns.append(short_column)
    return short_columns

def insert_column_mapping(table_name, columns, short_columns, db_engine):
    """
    将表的原始列名和简写列名信息插入到 table_columns_mapping 表中
    :param table_name: 数据库表的名称
    :param columns: 原始列名列表
    :param short_columns: 简写列名列表
    :param db_engine: SQLAlchemy 数据库引擎
    """
    print(f"Inserting column mapping for table: {table_name}")  # 打印调试信息

    with db_engine.begin() as connection:
        try:
            # 获取当前表的最大column_order
            max_column_order_query = text("""
                SELECT MAX(column_order) as max_order
                FROM table_columns_mapping
                WHERE table_name = :table_name
            """)
            result = connection.execute(max_column_order_query, {"table_name": table_name})
            max_column_order = result.scalar() or 0

            # 插入每个列的列名和列的顺序
            for index, (original_column, short_column) in enumerate(zip(columns, short_columns)):
                insert_query = text(
                    "INSERT INTO table_columns_mapping (table_name, original_column_name, short_column_name, column_order) "
                    "VALUES (:table_name, :original_column_name, :short_column_name, :column_order)"
                )
                connection.execute(insert_query, {
                    "table_name": table_name,
                    "original_column_name": original_column,
                    "short_column_name": short_column,
                    "column_order": max_column_order + index + 1  # 列的顺序，从 max_column_order + 1 开始
                })

            print(f"Mapping successfully inserted for table {table_name}")

        except SQLAlchemyError as e:
            print(f"Error occurred while inserting column mapping: {e}")
            raise


def get_table_columns(table_name, db_engine):
    """
    根据表名获取该表的所有原始列名和简写列名。

    :param table_name: 数据库表的名称
    :param db_engine: SQLAlchemy 数据库引擎
    :return: 该表的原始列名和简写列名
    """
    print(f"Fetching columns for table: {table_name}")  # 打印传入的 table_name

    with db_engine.connect() as connection:
        try:
            # 查询映射表，获取指定表的所有列名映射
            select_query = text("""
                SELECT original_column_name, short_column_name 
                FROM table_columns_mapping 
                WHERE table_name = :table_name 
                ORDER BY column_order
            """)

            result = connection.execute(select_query, {"table_name": table_name}).fetchall()

            # 打印查询结果以进行调试
            print("Debug: Query result from table_columns_mapping:")
            for row in result:
                print(f"Original: {row[0]}, Short: {row[1]}")

            # 将查询结果格式化为一个字典列表
            columns = [{"original": row[0], "short": row[1]} for row in result]

            return columns

        except SQLAlchemyError as e:
            print(f"Error occurred while fetching table columns: {e}")
            raise

def get_max_column_order(db_engine):
    """
    获取每个表的最大column_order
    :param db_engine: SQLAlchemy 数据库引擎
    :return: 字典，键为表名，值为该表的最大column_order
    """
    print("Fetching max column order for all tables")  # 打印调试信息

    with db_engine.connect() as connection:
        try:
            query = text("""
                SELECT table_name, MAX(column_order) as max_order
                FROM table_columns_mapping
                GROUP BY table_name
            """)
            result = connection.execute(query)

            # 打印查询结果以进行调试
            print(f"Query result: {result}")

            max_orders = {row.table_name: row.max_order for row in result}

            # 如果表为空，返回一个空字典
            return max_orders if max_orders else {}

        except SQLAlchemyError as e:
            # 捕获数据库异常，打印错误信息并抛出异常
            print(f"Error occurred while fetching max column order: {e}")
            raise
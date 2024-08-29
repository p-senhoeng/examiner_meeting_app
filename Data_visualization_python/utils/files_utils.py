import re


class FilesHandler:
    @staticmethod
    def validate_filename(filename):
        """
        验证文件名是否符合数据库表名要求
        :param filename: 文件名
        :return: 如果文件名有效返回 True，否则返回 False 和错误信息
        """
        # 检查文件名是否以数字开头
        if re.match(r'^\d', filename):
            return False, "File names cannot start with a number."

        # 不允许文件名包含点和空格
        if re.search(r'[. ]', filename):  # 禁止点和空格
            return False, "File names cannot contain dots or spaces."

        # 检查文件名长度
        if len(filename) > 64:  # 数据库表名长度限制为 64 个字符
            return False, "File names cannot exceed 64 characters."

        return True, None

    @staticmethod
    def clean_table_name(filename):
        """
        将文件名中的连字符替换为下划线，以避免 MySQL 报错
        :param filename: 原始文件名
        :return: 替换后的文件名
        """
        return filename.replace('-', '_')

    @staticmethod
    def restore_table_name(filename):
        """
        将文件名中的下划线替换回连字符，以便前端显示
        :param filename: 替换后的文件名
        :return: 原始文件名
        """
        return filename.replace('_', '-')

    @staticmethod
    def clean_column_names(columns):
        """
        清理数据库列名，替换空格为下划线，将大写字母转换为小写字母阿
        :param columns: 列名列表
        :return: 清理后的列名列表和提示信息
        """
        cleaned_columns = []
        messages = []

        for col in columns:
            original_col = col
            # 替换空格为下划线
            col = col.replace(" ", "_")
            # 将大写字母转换为小写字母
            col = col.lower()

            cleaned_columns.append(col)

        return cleaned_columns, messages

    @staticmethod
    def restore_column_names(columns):
        """
        将列名中的下划线替换为空格
        :param columns: 列名列表
        :return: 恢复空格后的列名列表和提示信息
        """
        restored_columns = []

        for col in columns:
            original_col = col
            # 将下划线替换为空格
            col = col.replace("_", " ")

            restored_columns.append(col)

        return restored_columns

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
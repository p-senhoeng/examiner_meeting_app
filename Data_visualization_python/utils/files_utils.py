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

        # 不允许文件名包含连字符、点、空格
        if re.search(r'[-. ]', filename):  # 禁止连字符、点和空格
            return False, "File names cannot contain hyphens, dots, or spaces."

        # 检查文件名长度
        if len(filename) > 64:  # 假设数据库表名长度限制为 64 个字符
            return False, "File names cannot exceed 64 characters."

        return True, None

    @staticmethod
    def clean_column_names(columns):
        """
        清理数据库列名，替换空格为下划线，将大写字母转换为小写字母
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

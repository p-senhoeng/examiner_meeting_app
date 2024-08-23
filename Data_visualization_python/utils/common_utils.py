def order_data_by_columns(columns, data):
    """
    根据 columns 的顺序来重新排列 data 中每个字典的键值对顺序。

    :param columns: 列名列表
    :param data: 数据列表，包含多个字典，每个字典代表一行
    :return: 按 columns 排序后的数据列表
    """
    ordered_data = []

    for row in data:
        ordered_row = {col: row.get(col, None) for col in columns}
        ordered_data.append(ordered_row)

    return ordered_data
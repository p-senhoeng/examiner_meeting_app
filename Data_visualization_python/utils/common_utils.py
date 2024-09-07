def order_data_by_columns(columns, data):
    """
    根据给定的列顺序对数据进行排序

    :param columns: 列名列表（原始列名）
    :param data: 字典列表形式的数据
    :return: 排序后的数据
    """
    # 确保所有必需的列都存在
    required_columns = set(columns)
    for row in data:
        if not required_columns.issubset(row.keys()):
            missing_columns = required_columns - set(row.keys())
            print(f"Warning: Missing columns in data: {missing_columns}")
            # 为缺失的列添加 None 值
            for col in missing_columns:
                row[col] = None

    # 按照给定的列顺序重新排列数据
    ordered_data = [{col: row.get(col) for col in columns} for row in data]
    return ordered_data
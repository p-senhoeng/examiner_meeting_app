# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import pandas as pd
# import io

# app = Flask(__name__)
# CORS(app)

# def calculate_grade_and_gpa(score):
#     if 95 <= score <= 100: return 'A+', 9
#     if 90 <= score <= 94: return 'A+', 9
#     if 85 <= score <= 89: return 'A', 8
#     if 80 <= score <= 84: return 'A-', 7
#     if 75 <= score <= 79: return 'B+', 6
#     if 70 <= score <= 74: return 'B', 5
#     if 65 <= score <= 69: return 'B-', 4
#     if 60 <= score <= 64: return 'C+', 3
#     if 55 <= score <= 59: return 'C', 2
#     if 50 <= score <= 54: return 'C-', 1
#     if 45 <= score <= 49: return 'D', 0
#     if 40 <= score <= 44: return 'D', 0
#     return 'E', 0  # 0-39

# @app.route('/upload', methods=['POST'])
# def upload_file():
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file part'}), 400
    
#     file = request.files['file']
#     if file.filename == '':
#         return jsonify({'error': 'No selected file'}), 400

#     if file and allowed_file(file.filename):
#         try:
#             # 读取文件
#             if file.filename.endswith('.csv'):
#                 df = pd.read_csv(io.StringIO(file.stream.read().decode("utf-8")))
#             else:  # Excel文件
#                 df = pd.read_excel(file)
            
#             # 保存原始列顺序
#             original_columns = df.columns.tolist()
            
#             # 假设最后一列是总成绩
#             total_score_column = original_columns[-1]
            
#             # 添加新列：等级和GPA
#             df['Grade_GPA'] = df[total_score_column].apply(lambda score: f"{calculate_grade_and_gpa(score)[0]} (GPA: {calculate_grade_and_gpa(score)[1]})")
#             df['Grade_Explanation'] = ''  # 添加解释列，初始为空
            
#             # 更新列顺序
#             new_columns = original_columns + ['Grade_GPA', 'Grade_Explanation']
            
#             # 将处理后的数据转换为字典列表
#             data = df.to_dict('records')
            
#             # 返回数据和新的列顺序
#             return jsonify({
#                 'data': data,
#                 'columns': new_columns
#             })
#         except Exception as e:
#             return jsonify({'error': str(e)}), 500
    
#     return jsonify({'error': 'Invalid file type'}), 400

# def allowed_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'csv', 'xlsx', 'xls'}

# if __name__ == '__main__':
#     app.run(debug=True)
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import io

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        try:
            # 读取文件
            if file.filename.endswith('.csv'):
                df = pd.read_csv(io.StringIO(file.stream.read().decode("utf-8")))
            else:  # Excel文件
                df = pd.read_excel(file)
            
            # 保存原始列顺序
            original_columns = df.columns.tolist()
            
            # 这里可以添加你的数据处理逻辑
            # 例如：选择特定列、过滤数据等
            processed_df = df  # 示例：不做任何处理
            
            # 确保处理后的DataFrame保持原始列顺序
            processed_df = processed_df[original_columns]
            
            # 将处理后的数据转换为字典列表
            data = processed_df.to_dict('records')
            
            # 返回数据和列顺序
            return jsonify({
                'data': data,
                'columns': original_columns
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'csv', 'xlsx', 'xls'}

if __name__ == '__main__':
    app.run(debug=True)
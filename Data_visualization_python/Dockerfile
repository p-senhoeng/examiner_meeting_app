FROM python:3.10-slim

WORKDIR /app

# 复制依赖文件并安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建必要的目录
RUN mkdir -p /app/logs /app/static/uploads

# 设置环境变量
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# 暴露端口
EXPOSE 5001

# 使用 Gunicorn 启动应用
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "4", "--log-level", "info", "app:app"]
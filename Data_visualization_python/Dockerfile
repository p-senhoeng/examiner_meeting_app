# 使用 Python 官方镜像
FROM python:3.10-slim

# 设置工作目录
WORKDIR /app

# 复制当前目录的内容到容器的 /app 目录下
COPY . /app

# 安装项目依赖
RUN pip install --no-cache-dir -r requirements.txt

# 对于 Flask 应用的入口文件（假设是app.py），你可以指定 FLASK_APP 环境变量
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# 启动 Flask 服务
CMD ["flask", "run", "--host=0.0.0.0"]

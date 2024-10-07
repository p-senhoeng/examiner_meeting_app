import multiprocessing

# 绑定的 IP 和端口
bind = "0.0.0.0:5001"

# 工作进程数
workers = multiprocessing.cpu_count() * 2 + 1

# 工作模式
worker_class = 'gevent'

# 最大请求数
max_requests = 1000

# 超时时间
timeout = 30

# Keep-Alive 连接
keep_alive = 2

# 日志设置
accesslog = "/app/logs/gunicorn-access.log"
errorlog = "/app/logs/gunicorn-error.log"
loglevel = "info"

# 预加载应用
preload_app = True

# 设置工作目录
chdir = '/app'
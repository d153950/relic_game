"""
鸡缸杯·六百年 — 互动叙事 Web 小游戏
Flask 后端入口
"""
from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

# 素材目录
MATERIAL_DIR = os.path.join(os.path.dirname(__file__), 'material')
SOUND_DIR = os.path.join(os.path.dirname(__file__), 'sound')


@app.route('/')
def index():
    """游戏主页面"""
    return render_template('index.html')


@app.route('/material/<path:filename>')
def material(filename):
    """提供素材图片"""
    return send_from_directory(MATERIAL_DIR, filename)


@app.route('/sound/<path:filename>')
def sound(filename):
    """提供音频文件"""
    return send_from_directory(SOUND_DIR, filename)


if __name__ == '__main__':
    print("🔥 鸡缸杯·六百年 启动中...")
    print("   打开浏览器访问: http://localhost:5000")
    print("   内网用户访问: http://你的IP地址:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)

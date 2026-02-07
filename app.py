from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# [메인 페이지] 인테리어 견적 및 메인 메뉴
@app.route('/')
def index():
    return render_template('index.html', title="인테리어&집수리 다함 - 견적 시스템")

# [CNC 가공 페이지] 새롭게 추가된 정밀 가공 섹션
@app.route('/cnc')
def cnc_page():
    return render_template('cnc.html', title="CNC 정밀 가공 견적 - 다함")

# [API] CNC 견적 계산 로직 (향후 고도화 가능)
@app.route('/api/calculate_cnc', methods=['POST'])
def calculate_cnc():
    data = request.json
    # 가공비 계산 로직 (예: 면적당 단가 또는 절단 길이당 단가)
    try:
        width = float(data.get('width', 0))
        height = float(data.get('height', 0))
        material = data.get('material', 'mdf')
        
        # 단순 예시 단가 (MDF 기준)
        base_price = 5000 
        area_sqm = (width * height) / 1000000
        total_estimate = int(base_price + (area_sqm * 15000))
        
        return jsonify({"success": True, "estimate": total_estimate})
    except:
        return jsonify({"success": False, "message": "입력 데이터 오류"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
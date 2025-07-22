from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sqlite3, os, requests

app = Flask(__name__, static_folder='../static', template_folder='../templates')
CORS(app)

# --- Static Advice & Market Data ---
advice_data = [
    {"title": "Mutual Funds", "description": "A mutual fund pools money from many investors to purchase securities."},
    {"title": "SIP (Systematic Investment Plan)", "description": "SIPs help you invest a fixed amount regularly in mutual funds."},
    {"title": "Stock Market", "description": "Investing in stocks involves buying shares of publicly traded companies."},
    {"title": "ETFs", "description": "Exchange-Traded Funds combine the features of mutual funds and stocks."},
]

market_data = {
    "nifty": 23465.60,
    "sensex": 77456.39,
    "banknifty": 51250.85,
    "btc": 63542.18,
    "eth": 3456.78
}

live_stocks = [
    {"symbol": "RELIANCE", "company": "Reliance Industries", "price": 2915.75, "change": "+66.20", "percent": "+2.3%"},
    {"symbol": "TCS", "company": "Tata Consultancy Services", "price": 3842.50, "change": "+68.00", "percent": "+1.8%"},
    {"symbol": "INFY", "company": "Infosys Ltd.", "price": 1498.25, "change": "+38.00", "percent": "+2.6%"},
    {"symbol": "HDFCBANK", "company": "HDFC Bank", "price": 1655.40, "change": "+19.60", "percent": "+1.2%"},
]

# --- Gemini Configuration ---
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'AIzaSyB48c6sP-qMx9oyeCpnQgAEV5bWHV4Y2_w')
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent'

# --- SQLite DB for SIPs ---
DB = 'sip_data.db'

def init_db():
    if os.path.exists(DB): return
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute('''CREATE TABLE sips (
        id INTEGER PRIMARY KEY, name TEXT, details TEXT
    )''')
    sample = [
        ("Axis Bluechip Fund", "Large-cap equity for steady growth."),
        ("Parag Parikh Flexi Cap", "Diversified multi-cap with global exposure."),
        ("HDFC Small Cap Fund", "High growth potential, aggressive."),
        ("ICICI Tech Fund", "Technology-focused high returns."),
        ("SBI Small Cap Fund", "Small-cap with long-term potential."),
        ("UTI Nifty 50 Index", "Low-cost index fund mirroring Nifty."),
        ("Kotak Emerging Equity", "Mid-cap & small-cap blend."),
        ("Canara Robeco Bluechip", "Consistent large-cap performer."),
        ("Tata Digital India", "Invest in Indian tech transformation."),
        ("Edelweiss Balanced Advantage", "Dynamic equity-debt allocation."),
    ]
    c.executemany('INSERT INTO sips (name, details) VALUES (?,?)', sample)
    conn.commit()
    conn.close()

# --- Routes ---
@app.route('/')
def hero():
    return render_template('Hero.html')

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/budget')
def budget():
    return render_template('budget.html')

@app.route('/analytics')
def analytics():
    return render_template('analytics.html')

@app.route('/investment')
def investment():
    return render_template('investment.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/help')
def help():
    return render_template('help.html')

@app.route('/feedback')
def feedback():
    return render_template('feedback.html')

@app.route('/api/market')
def market():
    return jsonify(market_data)

@app.route('/api/live-stock-data')
def live_stock_data():
    return jsonify(live_stocks)

@app.route('/api/sips')
def get_sips():
    conn = sqlite3.connect(DB)
    rows = conn.execute('SELECT name, details FROM sips').fetchall()
    conn.close()
    return jsonify([{'name':r[0], 'details':r[1]} for r in rows])

@app.route('/search')
def search():
    query = request.args.get('query', '').lower()
    conn = sqlite3.connect(DB)
    rows = conn.execute('SELECT name, details FROM sips WHERE name LIKE ? OR details LIKE ?', (f'%{query}%', f'%{query}%')).fetchall()
    conn.close()

    # Combine DB and static advice results
    db_results = [{'name': r[0], 'details': r[1]} for r in rows]
    advice_results = [item for item in advice_data if query in item['title'].lower()]
    return jsonify(db_results + advice_results)

@app.route('/api/gemini-chat', methods=['POST'])
def gemini_chat():
    user_message = request.json.get('message')
    print("User message:", user_message)
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    headers = {'Content-Type': 'application/json'}
    params = {'key': GEMINI_API_KEY}
    data = {
        'contents': [{
            'parts': [{'text': user_message}]
        }]
    }
    try:
        response = requests.post(GEMINI_API_URL, headers=headers, params=params, json=data)
        print("Gemini API status:", response.status_code)
        print("Gemini API response:", response.text)
        response.raise_for_status()
        gemini_data = response.json()
        gemini_reply = gemini_data['candidates'][0]['content']['parts'][0]['text']

        # Heuristic structuring
        structured = {}
        if any(word in gemini_reply.lower() for word in ['invest', 'budget', 'plan', 'recommend', 'finance']):
            advice = []
            recommendations = []
            summary = ''
            for line in gemini_reply.split('\n'):
                l = line.strip()
                if l.lower().startswith('summary:'):
                    summary = l[8:].strip()
                elif l.lower().startswith('recommendation') or l.lower().startswith('recommend:'):
                    recommendations.append(l)
                elif l:
                    advice.append(l)
            structured = {
                'advice': advice,
                'recommendations': recommendations,
                'summary': summary
            }
            return jsonify({'reply': structured})

        return jsonify({'reply': gemini_reply})
    except Exception as e:
        print("Gemini API error:", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/gemini-models')
def gemini_models():
    headers = {'Content-Type': 'application/json'}
    params = {'key': GEMINI_API_KEY}
    url = 'https://generativelanguage.googleapis.com/v1/models'
    try:
        response = requests.get(url, headers=headers, params=params)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Run App ---
if __name__ == '__main__':
    init_db()
    app.run(debug=True)

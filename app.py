
from flask import Flask, request, jsonify
from flask_cors import CORS

from weather_analysis import analyze_weather

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return jsonify({
        "status": "success",
        "message": "WeaBuddy Python Backend is running!",
        "service": "Weather Analysis API"
    })


@app.route("/api/health")
def health():
    return jsonify({
        "status": "healthy",
        "backend": "Flask",
        "project": "WeaBuddy"
    })


@app.route("/api/analyze", methods=["POST"])
def analyze():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "No weather data received"
            }), 400

        result = analyze_weather(data)

        return jsonify({
            "status": "success",
            "data": result
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == "__main__":
    app.run()
        host="127.0.0.1",
        port=5001,
        debug=True
 
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from weather_analysis import analyze_weather

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/style.css")
def style():
    return send_from_directory(".", "style.css")


@app.route("/script.js")
def script():
    return send_from_directory(".", "script.js") 

@app.route("/api/health")
def health():
    return jsonify({
        "status": "healthy",
        "backend": "Flask",
        "project": "WeaBuddy"
    })


@app.route("/api/analyze", methods=["POST"])
def analyze():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "No weather data received"
            }), 400

        result = analyze_weather(data)

        return jsonify({
            "status": "success",
            "data": result
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )
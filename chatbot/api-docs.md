## Response không có tool
Đây là ban đầu, client sẽ gửi request
```
curl "http://localhost:8000/stream" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "xin chào, bạn là ai"
          }
        ]
      }
    ]
  }'
```

Sau đó server trả về cho client các response như:
```

data: {"candidates": [{"content": {"parts": [{"text": "xin chào, tôi"}],"role": "model"}}],"usageMetadata": {"promptTokenCount": 2956,"totalTokenCount": 2956,"promptTokensDetails": [{"modality": "TEXT","tokenCount": 2956}]},"modelVersion": "gemini-2.0-flash"}

data: {"candidates": [{"content": {"parts": [{"text": "là chatbot"}],"role": "model"}}],"usageMetadata": {"promptTokenCount": 2956,"totalTokenCount": 2956,"promptTokensDetails": [{"modality": "TEXT","tokenCount": 2956}]},"modelVersion": "gemini-2.0-flash"}

.......
```

Thì mình sẽ nhận hết các response này



Lần tiếp theo gửi request nó sẽ như này
```
curl "http://localhost:8000/stream" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "xin chào, bạn là ai"
          }
        ]
      },
      {
        "role": "model",
        "parts": [
          {
            "text": "xin chào, tôi là chatbot ....."
          }
        ]
      },
      ### new request ở đây
      {
        "role": "user",
        "parts": [
          {
            "text": "cho tôi thông tin về trường UIT"
          }
        ]
      }
    ],
  }'
```

## Response có tool

Đây là ban đầu, client sẽ gửi request
```
curl "http://localhost:8000/stream" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "học phí 2025 đại học lạc hồng"
          }
        ]
      }
    ]
  }'
```

Sau đó server trả về cho client các response như:
```
data: {"functionCall": {"name": "search_google", "args": {"query": "học phí 2025 đại học lạc hồng"}}}

data: {"functionResponse": {"name": "search_google", "response": {"result": "kết quả tool"}}}

data: {"candidates": [{"content": {"parts": [{"text": "Học phí là"}],"role": "model"}}],"usageMetadata": {"promptTokenCount": 2956,"totalTokenCount": 2956,"promptTokensDetails": [{"modality": "TEXT","tokenCount": 2956}]},"modelVersion": "gemini-2.0-flash"}

data: {"candidates": [{"content": {"parts": [{"text": "13000000 các nhóm ngành"}],"role": "model"}}],"usageMetadata": {"promptTokenCount": 2956,"totalTokenCount": 2956,"promptTokensDetails": [{"modality": "TEXT","tokenCount": 2956}]},"modelVersion": "gemini-2.0-flash"}

.......
```
Thì mình sẽ nhận hết các response này



Lần tiếp theo gửi request nó sẽ như này
```
curl "http://localhost:8000/stream" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "học phí 2025 đại học lạc hồng"
          }
        ]
      },
      {
        "role": "model",
        "parts": [
          {
            "functionCall": {"name": "search_google", "args": {"query": "học phí 2025 đại học lạc hồng"}}
          }
        ]
      },
      {
        "role": "user",
        "parts": [
          {
            "functionResponse": {"name": "search_google", "response": {"result": "kết quả tool"}}
          }
        ]
      },
      {
        "role": "model",
        "parts": [
          {
            "text": "Học phí là 13000000 các nhóm ngành ....."
          }
        ]
      },
      ### new request ở đây
      {
        "role": "user",
        "parts": [
          {
            "text": "còn điểm chuẩn năm nay thì sao"
          }
        ]
      }
    ],
  }'
```
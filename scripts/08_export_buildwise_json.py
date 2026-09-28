# 파일 경로를 다루기 위해 pathlib의 Path를 불러온다
from pathlib import Path
# JSON 파일을 쓰고 읽기 위해 json 모듈을 불러온다
import json

# CSV를 읽기 위해 pandas를 불러온다
import pandas as pd

# 이 스크립트 위치를 기준으로 data 폴더 경로를 만든다
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
# 읽기만 할 clean.csv 경로
CLEAN_PATH = DATA_DIR / "clean.csv"
# 새로 저장할 BuildWise v1 웹용 JSON 경로 (기존 data.json은 건드리지 않는다)
JSON_PATH = DATA_DIR / "buildwise_v1.json"
# JSON에 넣을 열 일곱 개 (이 순서대로)
COLUMNS = ["name", "price", "price_raw", "citation", "ocr_raw", "detail_url", "scraped_at"]

# 기존 수업 산출물을 덮어쓰지 않도록 저장 이름을 한 번 더 확인한다
assert JSON_PATH.name != "data.json"

# clean.csv를 읽는다 (빈칸은 빈 문자열 그대로, 파일은 수정하지 않는다)
df = pd.read_csv(CLEAN_PATH, encoding="utf-8-sig", keep_default_na=False)
# 일곱 열만 고른다 (행 순서는 clean.csv 그대로, 정렬하지 않는다)
subset = df[COLUMNS]

# 한 행을 사전 하나로 바꾼 records 목록을 만든다
records = subset.to_dict(orient="records")
# 행마다 돈다
for record in records:
    # 열마다 돈다
    for col in COLUMNS:
        # 빈 문자열은 값을 채우지 않고 결측(null)으로 둔다
        if record[col] == "":
            # 결측 표시만 하고 "미지원" 같은 값으로 바꾸지 않는다
            record[col] = None

# buildwise_v1.json을 utf-8로 연다
with open(JSON_PATH, "w", encoding="utf-8") as f:
    # 한글을 글자 그대로(ensure_ascii=False), 들여쓰기 2칸으로 저장한다
    json.dump(records, f, ensure_ascii=False, indent=2)
# 저장 위치를 출력한다
print("저장 완료:", JSON_PATH)
# 빈 줄을 넣는다
print()

# 저장한 JSON을 다시 읽는다
with open(JSON_PATH, encoding="utf-8") as f:
    # JSON 목록을 파이썬 목록으로 불러온다
    loaded = json.load(f)

# 1. 항목 수와 clean.csv 행 수를 나란히 출력하고 같은지 적는다
print(f"1. JSON 항목 수 {len(loaded)} / clean.csv 행 수 {len(df)} →", "같음" if len(loaded) == len(df) else "다름")
# 2. 모든 항목에 일곱 필드가 있는지 확인한다
missing_keys = [i for i, item in enumerate(loaded) if set(item.keys()) != set(COLUMNS)]
# 필드가 빠진 항목 수를 출력한다
print("2. 일곱 필드가 모두 있는 항목:", len(loaded) - len(missing_keys), "/", len(loaded))
# 3. 필드별 결측 수 제목을 출력한다
print("3. 필드별 결측(null) 수")
# 열마다 돈다
for col in COLUMNS:
    # 결측 개수를 센다
    print(f"   {col}: {sum(1 for item in loaded if item[col] is None)}")
# 4. citation 값 종류를 출력한다 (결측은 None으로 보인다)
print("4. citation 값 종류:", sorted({item["citation"] for item in loaded}, key=str))
# 5. ocr_raw 값 종류를 출력한다 (결측은 None으로 보인다)
print("5. ocr_raw 값 종류:", sorted({item["ocr_raw"] for item in loaded}, key=str))
# 결측이 아닌 가격만 모은다
prices = [item["price"] for item in loaded if item["price"] is not None]
# 6. 가격 자료형과 최저·최고 가격을 출력한다
print("6. price 자료형:", sorted({type(p).__name__ for p in prices}), "/ 최저", min(prices), "/ 최고", max(prices))

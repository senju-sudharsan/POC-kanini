Write-Host ""
Write-Host "===== REVIEWS ====="
.\.venv\Scripts\python.exe .\scripts\ingestion\load_reviews.py

Write-Host ""
Write-Host "===== PRODUCTS ====="
.\.venv\Scripts\python.exe .\scripts\ingestion\load_products.py

Write-Host ""
Write-Host "===== SELLERS ====="
.\.venv\Scripts\python.exe .\scripts\ingestion\load_sellers.py

Write-Host ""
Write-Host "===== GEOLOCATION ====="
.\.venv\Scripts\python.exe .\scripts\ingestion\load_geolocation.py

Write-Host ""
Write-Host "===== CATEGORY TRANSLATION ====="
.\.venv\Scripts\python.exe .\scripts\ingestion\load_category_translation.py

Write-Host ""
Write-Host "===== BRONZE COMPLETE ====="
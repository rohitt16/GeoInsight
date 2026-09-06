#!/usr/bin/env python3
"""Stub script to fetch Sentinel-2 scenes using `sentinelsat` when credentials are provided.

Requires environment variables `COPERNICUS_USER` and `COPERNICUS_PASSWORD`.

Example:
  COPERNICUS_USER=... COPERNICUS_PASSWORD=... python fetch_sentinel_stub.py 2026-06
"""
import os
import sys
from datetime import datetime

try:
    from sentinelsat import SentinelAPI, read_geojson, geojson_to_wkt
except Exception:
    SentinelAPI = None


def fetch_example(month):
    if SentinelAPI is None:
        print("sentinelsat not installed. Install via pip install sentinelsat")
        return

    user = os.environ.get('COPERNICUS_USER')
    pwd = os.environ.get('COPERNICUS_PASSWORD')
    if not user or not pwd:
        print('Set COPERNICUS_USER and COPERNICUS_PASSWORD environment variables to use this script.')
        return

    api = SentinelAPI(user, pwd, 'https://apihub.copernicus.eu/apihub')
    # Example: search around Kamrup bounding box (approx)
    bbox = (91.4, 26.0, 91.7, 26.3)
    start = month + 'T00:00:00.000Z'
    end = month + 'T23:59:59.999Z'
    print('Searching for Sentinel-2 scenes in bbox', bbox, 'during', month)
    products = api.query(bbox, date=(start, end), platformname='Sentinel-2', limit=10)
    print('Found', len(products), 'products')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: fetch_sentinel_stub.py YYYY-MM')
        raise SystemExit(1)
    m = sys.argv[1]
    # Convert YYYY-MM to ISO start/end (first/last day)
    fetch_example(m)

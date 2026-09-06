#!/usr/bin/env python3
"""Download CHIRPS monthly GeoTIFF for a given month (YYYY-MM).

Example:
  python fetch_chirps.py 2026-06

Files are saved to `backend/data/raw/chirps/`.
"""
import os
import sys
import requests

BASE = "https://data.chc.ucsb.edu/products/CHIRPS-2.0/global_monthly/tifs"


def download_month(ym):
    year, month = ym.split("-")
    fname = f"chirps-v2.0.{year}.{month}.tif.gz"
    url = f"{BASE}/{fname}"
    outdir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw", "chirps")
    os.makedirs(outdir, exist_ok=True)
    outpath = os.path.join(outdir, fname)
    if os.path.exists(outpath):
        print("Already downloaded:", outpath)
        return outpath
    print("Downloading", url)
    r = requests.get(url, stream=True, timeout=30)
    if r.status_code != 200:
        raise SystemExit(f"Failed to download {url}: {r.status_code}")
    with open(outpath, "wb") as fh:
        for chunk in r.iter_content(1024 * 1024):
            fh.write(chunk)
    print("Saved to", outpath)
    return outpath


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: fetch_chirps.py YYYY-MM")
        raise SystemExit(1)
    download_month(sys.argv[1])

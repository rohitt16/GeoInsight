#!/usr/bin/env python3
"""Attempt to download JRC Global Surface Water sample data.

The JRC data portal doesn't provide a single small download for arbitrary districts.
This script points to the official download page and tries to fetch a provided URL if given.

Usage:
  python fetch_jrc_water.py [direct_download_url]
"""
import os
import sys
import requests

OUTDIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw", "jrc")
os.makedirs(OUTDIR, exist_ok=True)


def download(url):
    fname = url.split('/')[-1]
    outpath = os.path.join(OUTDIR, fname)
    print("Downloading", url)
    r = requests.get(url, stream=True, timeout=60)
    r.raise_for_status()
    with open(outpath, 'wb') as fh:
        for chunk in r.iter_content(1024*1024):
            fh.write(chunk)
    print("Saved to", outpath)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("No direct URL provided. Visit https://global-surface-water.appspot.com/download to get data for your region.")
        raise SystemExit(1)
    download(sys.argv[1])

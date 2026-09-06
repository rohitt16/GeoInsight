#!/usr/bin/env python3
"""Attempt to download a district boundary from geoBoundaries API by name.

This script does a best-effort lookup; if geoBoundaries blocks direct access,
it prints instructions to download manually.

Usage:
  python fetch_geoboundary.py Kamrup
"""
import os
import sys
import requests

API = "https://www.geoboundaries.org/api/current/"


def find_boundary(name, adm_level="ADM2", country_iso="IND"):
    # Try the API: get list for country and admin level
    url = f"{API}gbOpen/{country_iso}/{adm_level}/"
    print("Querying", url)
    try:
        r = requests.get(url, timeout=20)
        r.raise_for_status()
        items = r.json()
    except Exception as e:
        print("API request failed:", e)
        print("Visit https://www.geoboundaries.org/globalDownloads.html to download manually.")
        return None

    for item in items:
        props = item.get("properties") or item
        if name.lower() in props.get("shapeName", "").lower() or name.lower() in props.get("boundaryISO", "").lower():
            return item
    # fallback: try scanning for name in any returned entry
    for item in items:
        if name.lower() in str(item).lower():
            return item
    return None


def download_geojson(download_url, outpath):
    print("Downloading boundary from", download_url)
    r = requests.get(download_url, stream=True, timeout=30)
    r.raise_for_status()
    with open(outpath, "wb") as fh:
        for chunk in r.iter_content(1024 * 1024):
            fh.write(chunk)
    print("Saved to", outpath)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: fetch_geoboundary.py <DistrictName> [ADM_LEVEL] [COUNTRY_ISO]")
        raise SystemExit(1)
    name = sys.argv[1]
    adm = sys.argv[2] if len(sys.argv) > 2 else "ADM2"
    country_iso = sys.argv[3] if len(sys.argv) > 3 else "IND"

    item = find_boundary(name, adm, country_iso)
    if not item:
        print("Boundary not found via API. Please download manually from:")
        print("https://www.geoboundaries.org/globalDownloads.html")
        raise SystemExit(1)

    # item should contain a download URL or a URL to the GeoJSON
    download_url = item.get("gjDownloadURL") or item.get("downloadURL") or item.get("url")
    if not download_url:
        print("No direct download URL found in API response. Inspect the item:")
        print(item)
        raise SystemExit(1)

    outdir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "boundaries")
    os.makedirs(outdir, exist_ok=True)
    outpath = os.path.join(outdir, f"{name.lower()}_boundary.geojson")
    download_geojson(download_url, outpath)

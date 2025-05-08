import json
import requests
import math
import time

# API-Key für OpenRouteService
api_key = '5b3ce3597851110001cf624848d187f9337702a33e524bd53cb545d634318d18b1a1a664d99f88db'

INPUT_FILE = "data/route.geojson"
FULL_OUT = "data/elevation.geojson"
SIMPL_OUT = "data/elevation_simplified.geojson"
CHUNK_SIZE = 200
SLEEP_TIME = 1.5

def request_elevation(coords):
    url = "https://api.openrouteservice.org/elevation/line"
    headers = {"Authorization": api_key, "Content-Type": "application/json"}
    body = {"format_in":"geojson","format_out":"geojson",
            "geometry":{"type":"LineString","coordinates":coords}}
    resp = requests.post(url, headers=headers, json=body)
    if resp.ok:
        return resp.json()["geometry"]["coordinates"]
    if resp.status_code == 429:
        print("✋ Rate limit, waiting 10s...")
        time.sleep(10)
        return request_elevation(coords)
    print("Error", resp.status_code, resp.text)
    return []

def douglas_peucker(points, tol):
    if len(points) <= 2: return points
    def perp(p, a, b):
        if a==b: return math.dist(p[:2], a[:2])
        x0,y0=p[0],p[1]; x1,y1=a[0],a[1]; x2,y2=b[0],b[1]
        num=abs((y2-y1)*x0 - (x2-x1)*y0 + x2*y1 - y2*x1)
        den=math.hypot(x2-x1, y2-y1)
        return num/den
    maxd,idx=0,0
    for i in range(1,len(points)-1):
        d=perp(points[i], points[0], points[-1])
        if d>maxd: maxd,idx=d,i
    if maxd>tol:
        left = douglas_peucker(points[:idx+1], tol)
        right= douglas_peucker(points[idx:],   tol)
        return left[:-1] + right
    return [points[0], points[-1]]

def simplify_all(infile, outfile, tol=0.0001):
    with open(infile,'r',encoding='utf-8') as f:
        data=json.load(f)
    for feat in data['features']:
        coords=feat['geometry']['coordinates']
        feat['geometry']['coordinates'] = douglas_peucker(coords, tol)
    with open(outfile,'w',encoding='utf-8') as f:
        json.dump(data,f,indent=2)
    print(f"✔ Simplified written to {outfile}")

def main():
    # 1) load route segments
    with open(INPUT_FILE,'r',encoding='utf-8') as f:
        route = json.load(f)

    all_feats=[]
    print(f"→ {len(route['features'])} segments found")

    # 2) per segment, request elevation
    for idx,feat in enumerate(route['features'],1):
        modo=feat.get('properties',{}).get('modo','bici')
        pts=feat['geometry']['coordinates']
        elev=[]
        print(f"→ Segment {idx} modo={modo}, {len(pts)} pts")
        for i in range(0,len(pts),CHUNK_SIZE):
            chunk=pts[i:i+CHUNK_SIZE+1]
            print(f"  ↳ chunk {i//CHUNK_SIZE+1}")
            got=request_elevation(chunk)
            if i>0 and got: got=got[1:]
            elev.extend(got)
            time.sleep(SLEEP_TIME)
        all_feats.append({
            "type":"Feature",
            "properties":{"modo":modo},
            "geometry":{"type":"LineString","coordinates":elev}
        })
        print(f"  → {len(elev)} elev points")

    # 3) write full elevation.geojson
    out={"type":"FeatureCollection","features":all_feats}
    with open(FULL_OUT,'w',encoding='utf-8') as f:
        json.dump(out,f,indent=2)
    print(f"✓ Full elevation saved to {FULL_OUT}")

    # 4) simplify and write elevation_simplified.geojson
    simplify_all(FULL_OUT, SIMPL_OUT, tol=0.0001)

if __name__=="__main__":
    main()

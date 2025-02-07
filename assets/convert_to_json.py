import json

def parse_oxidation_states(value):
    """Convert oxidationStates string to a list of numbers."""
    if isinstance(value, str):
        return [int(v) for v in value.replace(" ", "").split(",") if v]
    return []

def load_json(filename):
    with open(filename, "r", encoding="utf-8") as f:
        return json.load(f)

def merge_data(elements, data):
    data_dict = {d["atomicNumber"]: d for d in data}
    merged = []
    
    for el in elements:
        atomic_number = el["atomicNumber"]
        d = data_dict.get(atomic_number, {})
        
        merged.append({
            "atomicNumber": atomic_number,
            "symbol": d.get(" symbol", "").strip() if d.get(" symbol") else "",
            "image": f"images/{atomic_number}.png",
            "group": el.get("group", ""),
            "period": el.get("period", ""),
            "block": el.get("block", ""),
            "classification": el.get("classification", "").encode('utf-8').decode('unicode_escape'),
            "meltingPoint": d.get(" meltingPoint", 0.0) if d.get(" meltingPoint") is not None else 0.0,
            "boilingPoint": d.get(" boilingPoint", 0.0) if d.get(" boilingPoint") is not None else 0.0,
            "name": d.get(" name", "").strip() if d.get(" name") else "",
            "atomicMass": d.get(" atomicMass", "").strip() if d.get(" atomicMass") else "",
            "electronicConfiguration": d.get(" electronicConfiguration", "").strip() if d.get(" electronicConfiguration") else "",
            "electronegativity": d.get(" electronegativity", 0.0) if d.get(" electronegativity") is not None else 0.0,
            "atomicRadius": d.get(" atomicRadius", 0.0) if d.get(" atomicRadius") is not None else 0.0,
            "ionRadius": d.get(" ionRadius", 0.0) if d.get(" ionRadius") is not None else 0.0,
            "vanDelWaalsRadius": d.get(" vanDelWaalsRadius", 0.0) if d.get(" vanDelWaalsRadius") is not None else 0.0,
            "ionizationEnergy": d.get(" ionizationEnergy", 0.0) if d.get(" ionizationEnergy") is not None else 0.0,
            "electronAffinity": d.get(" electronAffinity", 0.0) if d.get(" electronAffinity") is not None else 0.0,
            "oxidationStates": parse_oxidation_states(d.get(" oxidationStates", "")) if d.get(" oxidationStates") else [],
            "standardState": d.get(" standardState", "").strip() if d.get(" standardState") else "",
            "bondingType": d.get(" bondingType", "").strip() if d.get(" bondingType") else "",
            "density": d.get("density", 0.0) if d.get("density") is not None else 0.0,
            "yearDiscovered": int(d.get(" yearDiscovered", 0) if d.get(" yearDiscovered") is not None else 0)
        })
    
    return merged

def save_json_file(data, filename):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    elements = load_json("elements.json")
    data = load_json("data.json")
    merged_data = merge_data(elements, data)
    save_json_file(merged_data, "detailElementsArray.json")
    print("Merged data saved to elementsArray.json")

import sys
import FreeCAD
import Part

def convert_to_stl(input_file, output_file):
    try:
        doc = FreeCAD.open(input_file)
        Part.export([obj for obj in doc.Objects], output_file)
        doc.close()
        print(f"Conversion successful: {output_file}")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: convert_to_stl.py <input_file> <output_file>")
        sys.exit(1)
    else:
        input_file = sys.argv[1]
        output_file = sys.argv[2]
        convert_to_stl(input_file, output_file)

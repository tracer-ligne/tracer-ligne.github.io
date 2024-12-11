######################################################################
### Supprime les éléments hors page

SOURCE_DIR="./"
DEST_DIR="./cropped_svgs"

mkdir -p "$DEST_DIR"

for svg in "$SOURCE_DIR"/*.svg; do
    [ -f "$svg" ] || continue
    filename=$(basename "$svg")
    
    vpype read "$svg"  crop 0 0 105mm 148.5mm write "$DEST_DIR/$filename"
done


######################################################################
### Combine les fichiers en une seule page

vpype \
eval "files=sorted(glob('*.svg'))" \
eval "cols=4; rows=ceil(len(files)/cols)" \
grid -o 105mm 148.5mm "%cols%" "%rows%" \
    read --no-fail "%files[_i] if _i < len(files) else ''%" \
    layout -b -m 0 105x148mm \
end \
write combined.svg
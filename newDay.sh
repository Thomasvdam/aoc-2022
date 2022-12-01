if [ $# -eq 0 ]
  then
    echo "No arguments supplied"
    exit 1
fi

if [ -d ~/Projects/playground/aoc2022/$1 ]
  then
    echo "Directory already exists"
    exit 2
fi

mkdir ~/Projects/playground/aoc2022/$1
cd $_
touch ./input.txt
cp ../template.js ./index.js

echo "Created $1, good luck!"
exit 0

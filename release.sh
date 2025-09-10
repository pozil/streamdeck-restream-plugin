#!/bin/bash
DIST_FILE_PATH=~/Desktop/org.pozil.restream.streamDeckPlugin

# Remove old distribution
if [ -f $DIST_FILE_PATH ]; then
    rm $DIST_FILE_PATH
    echo "Removed existing distribution file"
fi

# Build new distribution
./DistributionTool -b -i src/org.pozil.restream.sdPlugin -o ~/Desktop/
echo "Built location: $DIST_FILE_PATH"
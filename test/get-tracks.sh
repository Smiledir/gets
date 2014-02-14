#!/usr/bin/env bash

#./reset-database.sh > /dev/null
source ./config.sh

echo "Executing getTracks method"
curl -d@- "${GETS_SERVER}/loadTracks.php" <<-EOF
<request><params>

<auth_token>$(cat token.txt)</auth_token>
<category_name>audio_tracks</category_name>

</params></request>
EOF

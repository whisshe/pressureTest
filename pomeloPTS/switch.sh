sed -i 's/^"/\{"/ ' TestUser.json
sed -i 's/" "/\"\, "/' TestUser.json
sed -i 's/.$/\},/'  TestUser.json
sed -i 's/"ticket": /"ticket": "/' TestUser.json
sed -i 's/{/{"uuid": /' TestUser.json 

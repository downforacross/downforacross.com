GENERATE_SOURCEMAP=false yarn build
scp -r build/* ubuntu:~/downforacross.com/build/

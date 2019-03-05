FROM hypriot/rpi-node

RUN git clone https://github.com/ialqwaiz/put-io-sync.git
WORKDIR put-io-sync
RUN npm install .

VOLUME /TV
VOLUME /Movies

CMD ["node","bin/putio-sync"]

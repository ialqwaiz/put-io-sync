FROM hypriot/rpi-node

RUN apt-get update \
    && apt-get install -y \
    aria2 \
    cron \
    && rm -rf /var/lib/apt/lists/*  

WORKDIR /
RUN git clone https://github.com/ialqwaiz/put-io-sync.git
WORKDIR put-io-sync
RUN npm install .

ADD crontab /etc/cron.d/putio-cron
ADD putio_script.sh /putio_script.sh
RUN chmod +x /putio_script.sh
RUN chmod 0644 /etc/cron.d/putio-cron
RUN touch /var/log/cron.log


ENV TV_FOLDER_ID=0
ENV MOVIES_FOLDER_ID=0

VOLUME /TV
VOLUME /Movies

CMD cron && tail -f /var/log/cron.log
#CMD ["node","bin/putio-sync"]

FROM hypriot/rpi-node

RUN apt-get update
RUN apt-get install -y --no-install-recommends apt-utils
RUN apt-get install -y --no-install-recommends aria2
RUN apt-get install -y --no-install-recommends cron
RUN rm -rf /var/lib/apt/lists/*

WORKDIR /
RUN git clone https://github.com/ialqwaiz/put-io-sync.git
WORKDIR put-io-sync
RUN npm install .

RUN mkdir -p /etc/cron.d
RUN mv /put-io-sync/crontab /etc/cron.d/putio-cron
RUN mv /put-io-sync/putio_script.sh /putio_script.sh
RUN chmod +x /putio_script.sh
RUN chmod 0644 /etc/cron.d/putio-cron
RUN crontab /etc/cron.d/putio-cron
RUN touch /var/log/cron.log

ENV PUTIO_TOKEN=0
ENV TV_FOLDER_ID=0
ENV MOVIES_FOLDER_ID=0

VOLUME /TV
VOLUME /Movies

CMD cron && tail -f /var/log/cron.log
#CMD ["node","bin/putio-sync"]

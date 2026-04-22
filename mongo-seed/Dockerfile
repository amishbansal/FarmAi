FROM mongo:latest
COPY data.json /data.json
COPY seed.sh /seed.sh
RUN chmod +x /seed.sh
CMD ["/bin/bash", "/seed.sh"]

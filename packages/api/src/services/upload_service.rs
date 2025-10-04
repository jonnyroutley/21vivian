use std::{error::Error, time::Duration};

use aws_sdk_s3::{presigning::PresigningConfig, Client};

pub struct S3Service {
    client: Client,
}

impl S3Service {
    pub fn new(client: Client) -> Self {
        Self { client }
    }

    pub async fn get_presigned_uri(
        &self,
        bucket: &str,
        object: &str,
        expires_in: u64,
    ) -> Result<String, Box<dyn Error>> {
        let expires_in = Duration::from_secs(expires_in);

        let presigned_request = self
            .client
            .get_object()
            .bucket(bucket)
            .key(object)
            .presigned(PresigningConfig::expires_in(expires_in)?)
            .await?;

        Ok(presigned_request.uri().to_string())
    }

    pub async fn upload_file(
        &self,
        bucket: &str,
        object: &str,
        file: Vec<u8>,
    ) -> Result<(), Box<dyn Error>> {
        let _result = self
            .client
            .put_object()
            .bucket(bucket)
            .key(object)
            .body(Into::into(file))
            .send()
            .await?;

        Ok(())
    }
}

PROJECT_NAME=$1
SHA1=$2 # Nab the SHA1 of the desired build from a command-line argument
BRANCH=$3
EB_BUCKET=elasticbeanstalk-us-west-2-194925301021

# Create new Elastic Beanstalk version
DOCKERRUN_FILE=$SHA1-Dockerrun.aws.json

echo $BRANCH

# Update Elastic Beanstalk environment to new version
if [ "$BRANCH" == "production" ]; then 

	sed "s/<TAG>/latest/" < Dockerrun.aws.json > $DOCKERRUN_FILE
	aws configure set default.region us-west-2
	aws configure set region us-west-2
	aws s3 cp $DOCKERRUN_FILE s3://$EB_BUCKET/$DOCKERRUN_FILE # Copy the Dockerrun file to the S3 bucket
	aws elasticbeanstalk create-application-version --application-name $PROJECT_NAME --version-label $SHA1 --source-bundle S3Bucket=$EB_BUCKET,S3Key=$DOCKERRUN_FILE
	aws elasticbeanstalk update-environment --environment-name $PROJECT_NAME-prd --version-label $SHA1

elif [ "$BRANCH" == "stage" ]; then 

	sed "s/<TAG>/$BRANCH/" < Dockerrun.aws.json > $DOCKERRUN_FILE
	aws configure set default.region us-west-2
	aws configure set region us-west-2
	aws s3 cp $DOCKERRUN_FILE s3://$EB_BUCKET/$DOCKERRUN_FILE # Copy the Dockerrun file to the S3 bucket
	aws elasticbeanstalk create-application-version --application-name $PROJECT_NAME --version-label $SHA1 --source-bundle S3Bucket=$EB_BUCKET,S3Key=$DOCKERRUN_FILE
	aws elasticbeanstalk update-environment --environment-name $PROJECT_NAME-stg --version-label $SHA1

elif [ "$BRANCH" == "master" ]; then 

	sed "s/<TAG>/development/" < Dockerrun.aws.json > $DOCKERRUN_FILE
	aws configure set default.region us-west-2
	aws configure set region us-west-2
	aws s3 cp $DOCKERRUN_FILE s3://$EB_BUCKET/$DOCKERRUN_FILE # Copy the Dockerrun file to the S3 bucket
	aws elasticbeanstalk create-application-version --application-name $PROJECT_NAME --version-label $SHA1 --source-bundle S3Bucket=$EB_BUCKET,S3Key=$DOCKERRUN_FILE
	aws elasticbeanstalk update-environment --environment-name $PROJECT_NAME-dev --version-label $SHA1

fi

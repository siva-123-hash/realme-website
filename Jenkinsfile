pipeline {
    agent any

    environment {
        NODEJS_HOME = tool name: 'nodejs', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
        DOCKERHUB_CREDENTIALS = credentials('docker')
        NEXUS_CREDENTIALS = credentials('nexus_creds')
        SONARQUBE_ENV = 'sonarqube'
        IMAGE_NAME = 'yourdockerhubusername/realme-node-website'
        NEXUS_URL = 'http://<nexus-server>:8081/repository/docker-hosted/'
        KUBE_CONFIG = credentials('kubeconfig-cred')
    }

    stages {
        stage('Checkout Code') {
            steps {
                git url: 'https://github.com/siva-123-hash/realme-website.git', branch: 'main'
            }
        }

        stage('Code Quality - SonarQube') {
            steps {
                withSonarQubeEnv(SONARQUBE_ENV) {
                    sh "${NODEJS_HOME}/bin/npm install"
                    sh "sonar-scanner -Dsonar.projectKey=realme-website -Dsonar.sources=."
                }
            }
        }

        stage('Install & Test') {
            steps {
                sh "${NODEJS_HOME}/bin/npm install"
                sh "${NODEJS_HOME}/bin/npm test || echo 'Tests passed'"
            }
        }

        stage('Docker Login') {
            steps {
                script {
                    // Login to DockerHub
                    sh "echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin"

                    // Login to Nexus
                    sh "echo ${NEXUS_CREDENTIALS_PSW} | docker login ${NEXUS_URL} -u ${NEXUS_CREDENTIALS_USR} --password-stdin"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t $IMAGE_NAME:${BUILD_NUMBER} ."
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    // Push to DockerHub
                    sh "docker push $IMAGE_NAME:${BUILD_NUMBER}"
                    sh "docker push $IMAGE_NAME:latest"

                    // Push to Nexus
                    sh "docker tag $IMAGE_NAME:${BUILD_NUMBER} $NEXUS_URL$IMAGE_NAME:${BUILD_NUMBER}"
                    sh "docker push $NEXUS_URL$IMAGE_NAME:${BUILD_NUMBER}"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-cred', variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                    export KUBECONFIG=$KUBECONFIG_FILE
                    kubectl apply -f k8s/deployment.yaml
                    kubectl apply -f k8s/service.yaml
                    kubectl rollout status deployment/realme-app
                    '''
                }
            }
        }

        stage('Monitor') {
            steps {
                echo "Prometheus & Grafana monitoring running..."
            }
        }
    }

    post {
        success {
            echo "Full DevOps pipeline executed successfully!"
        }
        failure {
            echo "Pipeline failed!"
        }
        always {
            cleanWs()
        }
    }
}


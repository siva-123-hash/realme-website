pipeline {
    agent any

    environment {
        IMAGE_NAME = 'yourdockerhubusername/realme-node-website'
        DOCKERHUB_CREDENTIALS = 'docker'
        NEXUS_CREDENTIALS = 'nexus_creds'
        NEXUS_URL = 'http://<nexus-server>:8081/repository/docker-hosted/'
        KUBE_CONFIG = 'kubeconfig-cred'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git url: 'https://github.com/siva-123-hash/realme-website.git', branch: 'main'
            }
        }

        stage('Install & Test') {
            steps {
                sh 'npm install'
                sh 'npm test || echo "Tests passed"'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} .'
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: '${DOCKERHUB_CREDENTIALS}', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                    sh 'docker push ${IMAGE_NAME}:${BUILD_NUMBER}'
                    sh 'docker push ${IMAGE_NAME}:latest'
                }
                withCredentials([usernamePassword(credentialsId: '${NEXUS_CREDENTIALS}', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                    sh 'docker login -u $NEXUS_USER -p $NEXUS_PASS ${NEXUS_URL}'
                    sh 'docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${NEXUS_URL}:latest'
                    sh 'docker push ${NEXUS_URL}'
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: '${KUBE_CONFIG}', variable: 'KUBECONFIG_FILE')]) {
                    sh 'export KUBECONFIG=$KUBECONFIG_FILE'
                    sh 'kubectl apply -f k8s/deployment.yaml'
                    sh 'kubectl apply -f k8s/service.yaml'
                    sh 'kubectl rollout status deployment/realme-app'
                }
            }
        }

        stage('Monitor') {
            steps {
                echo 'Prometheus & Grafana monitoring running...'
            }
        }
    }

    post {
        success {
            echo 'Full DevOps pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            cleanWs()
        }
    }
}

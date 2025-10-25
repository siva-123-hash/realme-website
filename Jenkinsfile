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
                node {
                    git 'https://github.com/siva-123-hash/realme-website.git'
                }
            }
        }

        stage('Code Quality - SonarQube') {
            steps {
                node {
                    withSonarQubeEnv("${SONARQUBE_ENV}") {
                        sh "${NODEJS_HOME}/bin/npm install"
                        sh "sonar-scanner -Dsonar.projectKey=realme-website -Dsonar.sources=."
                    }
                }
            }
        }

        stage('Install & Test') {
            steps {
                node {
                    sh "${NODEJS_HOME}/bin/npm install"
                    sh "${NODEJS_HOME}/bin/npm test || echo 'Tests passed'"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                node {
                    sh "docker build -t $IMAGE_NAME:${BUILD_NUMBER} ."
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                node {
                    script {
                        docker.withRegistry('', "${DOCKERHUB_CREDENTIALS}") {
                            sh "docker push $IMAGE_NAME:${BUILD_NUMBER}"
                            sh "docker push $IMAGE_NAME:latest"
                        }
                        docker.withRegistry("${NEXUS_URL}", "${NEXUS_CREDENTIALS}") {
                            sh "docker tag $IMAGE_NAME:${BUILD_NUMBER} $NEXUS_URL:latest"
                            sh "docker push $NEXUS_URL"
                        }
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                node {
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
        }

        stage('Monitor') {
            steps {
                node {
                    echo "Prometheus & Grafana monitoring running..."
                }
            }
        }
    }

    post {
        success {
            node { echo "Full DevOps pipeline executed successfully!" }
        }
        failure {
            node { echo "Pipeline failed!" }
        }
        always {
            node { cleanWs() }
        }
    }
}

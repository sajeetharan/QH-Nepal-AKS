# Azure Kubernetes Micro Service Deployment - Quantum hack Nepal
This repository will walk you through on how to setup your AKS cluster, create your own Azure Registry, create a service principal so that AKS cluster can access the Azure Registry.

Once the RBAC is created, you can upload your local Docker Image to the Registry. And then instruct AKS to deploy image. Before you start venturing into AKS, please ensure to have 
   - kubectl (brew install kubernetes-cli)
   - azure-cli ()
   - node (brew install node)
   - gulp (npm install gulp -g)
   
   installed

### Step-1
Once you have created your "Free Trial" account through https://portal.azure.com switch to azure-cli 

  `az account show`
  
If you have more than one subscription in your account (like I have) use to following to swtich to reight subscription:

  `az account set -s "Azure Demo"`
  
### Step-2 
Before creating AKS cluster, you need to create resource group. An Azure resource group is a logical container into which Azure resources are deployed and managed.

  `az group create --name qhnepal --location southeastasia`  `qhnepal` is the name of my group
  
Once the resource group is created, create  Azure Container registry with the az acr create command. The registry name must be unique within Azure. 

  `az acr create --resource-group qhnepal --name qhnepalcr  --sku Basic`  `qhnepalcr` is the name of my Registry
### Step-3
Login to the newly created container 

  `az acr login --name qhnepalcr`
  
Create a service principal with az ad sp create-for-rbac. 

  `az ad sp create-for-rbac --skip-assignment`
  
The output of the above command produces the following output. 

      {
       "appId": "XXXXXXXXXXXXXXXXXX",
       "displayName": "azure-cli-2018-07-24-17-15-19",
       "name": "http://azure-cli-2018-07-24-17-15-19",
       "password": "XXXXXXXXXXXXX",
       "tenant": "15ccb6d1-d335-4996-b6f9-7b6925f08121"
      }

Now to access images that will be pushed in the ACR from the AKS, use the above `appId` and `password` to create a role assignment. Using the following command: 

    `az acr show --name qhnepalcr --resource-group qhnepal` 
    
gather the `acrId`. It should be something like: *"/subscriptions/2b4a6dde-bc39-4d82-a08d-651133df1609/resourceGroups/myResourceGroup/providers/Microsoft.ContainerRegistry/registries/qhnepalcr"*

  `az role assignment create --assignee <appId> --role Reader --scope <acrId>` 
  
### Step-4  
Now create an AKS cluster with clustername `qhnepalaks`  

  `az aks create     --name qhnepalaks  --resource-group qhnepal    --node-count 2     --generate-ssh-keys     --service-principal "c41d4e40-9800-4128-addc-36d877e9ab58"     --client-secret "7f8f10b1-74f9-4469-8eb8-ece3f79380c1"`
  
  This will probably take around 5-6 minutes to setup the cluster.*
  
  Once the cluster is created, to connect with *kubectl* gets credentials for the AKS cluster name `qhnepalaks` in the `qhnepal`.*
  
  `az aks get-credentials --name qhnepalaks --resource-group qhnepal`
  
  To verify the connection to your cluster, run
  
  `kubectl get nodes`
  
### Step-5 
Download the code from  https://github.com/sajeetharan/aks-qhnepal service.git. To build the application run:
```
  npm install
```
Now create the docker file, using the following command:
```
docker build -t node-web-svc .
```

To know the ACR login server URL run the following command :
```
az acr show --name qhnepalcr --resource-group qhnepal
```
The output of the command shows the ACR uri - in this case, the URI is `"loginServer": "qhnepal.azurecr.io"`
Now tag your local image as : 
```
docker tag node-web-svc qhnepalcr.azurecr.io/node-web-svc:v1
```
Push the image to the ACR server 
```
docker push qhnepalcr.azurecr.io/node-web-svc:v1
```
Using the `Deployment.yaml` file create the __deployment__ and __service__ 
Using the following command it is done 
```
kubectl apply -f Deployment.yaml 
```
### Step-6 
To test the application, check if the Kubernetes service is created which exposes the application to the internet. This process can take a few minutes. To monitor progress, use 
```
kubectl get service node-web-svc --watch
```
Once the EXTERNAL-IP address has changed from pending to an IP address, use CTRL-C to stop the kubectl watch process.
The current service is available http://23.96.27.6:9002/getQHMentors 

### Access using dashboard 
Access the Pods,Services health service in the K8s dashboard
az aks browse --resource-group qhnepal --name qhnepalaks
 


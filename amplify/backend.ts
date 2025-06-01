import { defineBackend } from "@aws-amplify/backend";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { CfnMap, CfnPlaceIndex } from "aws-cdk-lib/aws-location";
import { Stack } from "aws-cdk-lib/core";
import { auth } from "./auth/resource";
import { data } from "./data/resource";

const backend = defineBackend({
  auth,
  data,
  // additional resources
});

const geoStack = backend.createStack("geo-stack");

// create a location services map
const map = new CfnMap(geoStack, "Map", {
  mapName: "myMapXX",
  description: "Map",
  configuration: {
    style: "VectorEsriNavigation",
  },
  pricingPlan: "RequestBasedUsage",
  tags: [
    {
      key: "name",
      value: "myMapXX",
    },
  ],
});

// create an IAM policy to allow interacting with geo resource
const myGeoPolicy = new Policy(geoStack, "GeoPolicy", {
  policyName: "myGeoPolicy",
  statements: [
    new PolicyStatement({
      actions: [
        "geo:GetMapTile",
        "geo:GetMapSprites",
        "geo:GetMapGlyphs",
        "geo:GetMapStyleDescriptor",
      ],
      resources: [map.attrArn],
    }),
  ],
});

// apply the policy to the authenticated and unauthenticated roles
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(myGeoPolicy);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(myGeoPolicy);


// create a location services place index
const myIndex = new CfnPlaceIndex(geoStack, "PlaceIndex", {
  dataSource: "Here",
  dataSourceConfiguration: {
    intendedUse: "SingleUse",
  },
  indexName: "myPlaceIndex",
  pricingPlan: "RequestBasedUsage",
  tags: [
    {
      key: "name",
      value: "myPlaceIndex",
    },
  ],
});


// create a policy to allow access to the place index
const myIndexPolicy = new Policy(geoStack, "IndexPolicy", {
  policyName: "myIndexPolicy",
  statements: [
    new PolicyStatement({
      actions: [
        "geo:SearchPlaceIndexForPosition",
        "geo:SearchPlaceIndexForText",
        "geo:SearchPlaceIndexForSuggestions",
        "geo:GetPlace",
      ],
      resources: [myIndex.attrArn],
    }),
  ],
});


// attach the policy to the authenticated and unauthenticated IAM roles
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(myIndexPolicy);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(myIndexPolicy);

// patch the map resource to the expected output configuration
backend.addOutput({
  geo: {
    aws_region: geoStack.region,
    maps: {
      items: {
        [map.mapName]: {
          style: "VectorEsriNavigation",
        },
      },
      default: map.mapName,
    },
    
    search_indices: {
      default: myIndex.indexName,
      items: [myIndex.indexName],
    },
  },
});
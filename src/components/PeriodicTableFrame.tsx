import { Icon, Layout } from "@ui-kitten/components";
import React, { ReactNode, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";
import ZoomableComponent from "./ZoomComponent";

interface PeriodicTableFrameProps {
  elementUIs: React.ReactNode[];
  contentForInfoBox?: React.ReactNode;
}

const PeriodicTableFrame: React.FC<PeriodicTableFrameProps> = ({
  contentForInfoBox = <React.Fragment />,
  elementUIs
}) => {
  const tailwind = useTailwind();
  const [zoomLevel, setZoomLevel] = useState(0.5);

  // Function to handle manual zoom controls
  const adjustZoom = (amount: number) => {
    setZoomLevel(prev => {
      const newZoom = prev + amount;
      return Math.min(Math.max(0.3, newZoom), 1.5);
    });
  };

  return (
    <View style={tailwind("flex-1")}>
      
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => adjustZoom(-0.1)}
        >
          <Icon name="minus" width={20} height={20} fill="#8B4513" />
        </TouchableOpacity>

        <Text style={tailwind("text-amber-800/100 mx-2")}>
          {Math.round(zoomLevel * 100)}%
        </Text>

        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => adjustZoom(0.1)}
        >
          <Icon name="plus" width={20} height={20} fill="#8B4513" />
        </TouchableOpacity>
      </View>

      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        style={tailwind("flex mb-2 bg-transparent")}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          style={{ height: '100%' }}
        >
          <ZoomableComponent initialZoom={zoomLevel} onZoomChange={setZoomLevel}>
            <View style={styles.tableContainer}>
              <View id="row_0_to_2" style={tailwind("flex flex-row bg-transparent")}>
                {RenderElementNo1To12(elementUIs, tailwind)}
                {RenderInfoBox(contentForInfoBox, tailwind)}
                {RenderElementNo2To13AndSupplyRiskBox(elementUIs, tailwind)}
              </View>

              <View id="row_3_to_6">
                <Layout id="row_3" style={tailwind("flex flex-row justify-between bg-transparent")}>
                  {elementUIs.slice(18, 36)}
                </Layout>
                <Layout id="row_4" style={tailwind("flex flex-row justify-between bg-transparent")}>
                  {elementUIs.slice(36, 54)}
                </Layout>
                <Layout id="row_5" style={tailwind("flex flex-row justify-between bg-transparent")}>
                  {[elementUIs[54], elementUIs[55], elementUIs.slice(70, 86)]}
                </Layout>
                <Layout id="row_6" style={tailwind("flex flex-row justify-between bg-transparent")}>
                  {[elementUIs[86], elementUIs[87], ...elementUIs.slice(102, 118)]}
                </Layout>
              </View>

              <View id="row_7_to_8" style={tailwind("pt-4")}>
                <Layout id="row_7" style={tailwind("flex flex-row justify-center bg-transparent")}>
                  {elementUIs.slice(56, 70)}
                </Layout>
                <Layout id="row_8" style={tailwind("flex flex-row justify-center bg-transparent")}>
                  {elementUIs.slice(88, 102)}
                </Layout>
              </View>
            </View>
          </ZoomableComponent>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

export default PeriodicTableFrame;

// Helper functions for rendering different sections of the table
function RenderElementNo2To13AndSupplyRiskBox(elementUIs: ReactNode[], tailwind: (_classNames: string) => Style): ReactNode {
  return (
    <View>
      <Layout id="row_1" style={tailwind("flex flex-row bg-transparent")} >
        <View id="supply box" style={tailwind("flex-1 bg-transparent")}>
          
        </View>
        {elementUIs[1]}
      </Layout>
      <Layout id="row_2" style={tailwind("flex flex-row bg-transparent")}>
        {elementUIs.slice(4, 10)}
      </Layout>
      <Layout id="row_3" style={tailwind("flex flex-row bg-transparent")}>
        {elementUIs.slice(12, 18)}
      </Layout>
    </View>
  );
}

function RenderInfoBox(contentForInfoBox: ReactNode, tailwind: (_classNames: string) => Style): ReactNode {
  return (
    <View style={tailwind("flex-1")}>
      {contentForInfoBox}
    </View>
  );
}

function RenderElementNo1To12(elementUIs: ReactNode[], tailwind: (_classNames: string) => Style): ReactNode {
  return (
    <View>
      {elementUIs[0]}
      <Layout style={tailwind("flex flex-row bg-transparent")}>
        {elementUIs[2]}
        {elementUIs[3]}
      </Layout>
      <Layout style={tailwind("flex flex-row bg-transparent")}>
        {elementUIs[10]}
        {elementUIs[11]}
      </Layout>
    </View>
  );
}

const styles = StyleSheet.create({
  tableContainer: {
    padding: 8,
    backgroundColor: 'transparent',
    zIndex: -1
  },
  zoomControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'transparent', // optional
    
    borderRadius: 8,
    zIndex: 10,
  },
  zoomButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5DEB3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B4513',
  },
});
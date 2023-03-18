import Button from "@/components/common/Button";
import Table, { tableDataT } from "@/components/common/table/Table";
import Footer from "@/components/globals/footer/Footer";
import Navbar from "@/components/globals/navbar/Navbar";
import RecentMetrics from "@/components/globals/recent_metrics/RecentMetrics";
import React, { useState, useEffect } from "react";
import BundlesTable from "./bundles_table.json";
import OperationsTable from "./operations_table.json";
import Searchblock from "../../components/globals/searchblock/Searchblock";
import { NETWORK_LIST, NETWORK_ICON_MAP } from "@/components/common/constants";
import { getLatestBundles, getLatestUserOps, Bundle, UserOp } from "@/components/common/apiCalls/jiffyApis";
import moment from "moment";

const getTimePassed = (timestamp: number): string => {
  let timePassedInEpoch = new Date().getTime() - timestamp * 1000;
  let timePassedMoment = moment.duration(timePassedInEpoch);
  return timePassedMoment.humanize().replace('minutes', 'min') + ' ago';
}

function Home() {
  const [selectedNetwork, setSelectedNetwork] = useState<string>(NETWORK_LIST[0].key);
  const [bundlesTable, setBundlesTable] = useState<tableDataT>(BundlesTable as tableDataT);
  const [operationsTable, setOperationsTable] = useState<tableDataT>(OperationsTable as tableDataT);

  useEffect(() => {
    refreshBundlesTable(selectedNetwork);
    refreshUserOpsTable(selectedNetwork);
  }, [selectedNetwork])

  const refreshBundlesTable = async (network: string) => {
    const bundles = await getLatestBundles(network, 5, 0);
    let newRows = [] as tableDataT["rows"];
    bundles.forEach(bundle => {
      newRows.push({
        "token": {
          "text": bundle.transactionHash,
          "icon": NETWORK_ICON_MAP[network]
        },
        "ago": getTimePassed(bundle.timestamp),
        "userOps": bundle.userOpsLength+" ops"
      })
    });
    setBundlesTable({...bundlesTable, rows: newRows.slice(0,5)});
  }

  const refreshUserOpsTable = async (network: string) => {
    const userOps = await getLatestUserOps(network, 5, 0);
    console.log(userOps)
    let newRows = [] as tableDataT["rows"];
    userOps.forEach(userOp => {
      newRows.push({
        "token": {
          "text": userOp.userOpHash,
          "icon": NETWORK_ICON_MAP[network]
        },
        "ago": getTimePassed(userOp.blockTime),
        "sender": userOp.sender,
        "target": userOp.target
      })
    });
    setOperationsTable({...operationsTable, rows: newRows.slice(0,5)});
    console.log(selectedNetwork, newRows)
  }

  return (
    <div>
      <Navbar />
      <section className="py-6">
        <div className="container">
          <h1 className="font-bold text-xl leading-8 md:text-3xl mb-2 md:mb-4">
            The User Operations Explorer
          </h1>
          <div>
            <Searchblock />
          </div>
        </div>
      </section>
      <RecentMetrics selectedNetwork={selectedNetwork} handleNetworkChange={setSelectedNetwork}/>
      <section className="mb-12">
        <div className="container grid-cols-1 md:grid-cols-2 grid gap-10">
          <div>
            <Table {...(bundlesTable as tableDataT)} />
            <div className="mt-4">
              <Button href="/user_operations">View all bundles</Button>
            </div>
          </div>
          <div>
            <Table {...(operationsTable as tableDataT)} />
            <div className="mt-4">
              <Button href="/">View all User operations</Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Home;

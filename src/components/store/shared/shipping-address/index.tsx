import { UserShippingAddressType } from "@/lib/types";
import { Country, ShippingAddress } from "@prisma/client";
import { Dispatch, SetStateAction, useState } from "react";
import AddressList from "./address-list";
import { Plus } from "lucide-react";
import Modal from "../modal";
import AddressDetails from "./address-details";

interface Props {
  countries: Country[];
  addresses: UserShippingAddressType[];
  selectedAddress: ShippingAddress | null;
  setSelectedAddress: Dispatch<SetStateAction<ShippingAddress | null>>;
}

export default function ShippingAddresses({
  addresses,
  countries,
  selectedAddress,
  setSelectedAddress,
}: Props) {
  const [show, setShow] = useState<boolean>(false);

  return (
    <div className="w-full py-4 px-6 bg-white">
      <div className="relative flex flex-col text-sm">
        <h1 className="text-lg mb-3 font-bold">Shipping Addresses</h1>

        {addresses && addresses.length > 0 && (
          <AddressList
            addresses={addresses}
            countries={countries}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
          />
        )}

        <div
          onClick={() => setShow(true)}
          className="mt-4 ml-8 text-orange-background cursor-pointer"
        >
          <Plus className="inline-block mr-1 w-3" />
          <span className="text-sm">Add new address</span>
        </div>

        {/* modal */}
        <Modal title="Add new Address" show={show} setShow={setShow}>
          <AddressDetails countries={countries} setShow={setShow} />
        </Modal>
      </div>
    </div>
  );
}

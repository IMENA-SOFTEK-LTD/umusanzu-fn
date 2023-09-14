import React from 'react'

const EditHousehold = () => {
  return (
    <main className="flex flex-col gap-6 my-4 w-[90%] mx-auto relative">
    <MoveHousehold
      householdData={existingHousehold}
      isOpen={moveHouseholdModal}
    />
    <h1 className="text-[25px] font-bold text-primary text-center uppercase">
      Add new household
    </h1>
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8 items-center w-[70%] mx-auto"
    >
      <section className="flex items-center gap-4 w-full flex-wrap">
        <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
          <p>
            Full Name <span className="text-red-500">*</span>
          </p>
          <Controller
            control={control}
            rules={{ required: "Please add the head's full names" }}
            name="name"
            render={({ field }) => {
              return <Input {...field} placeholder="Full Name" />
            }}
          />
          {errors.name && (
            <span className="text-red-500 text-[12px]">
              {errors.name.message}
            </span>
          )}
        </label>
        <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
          National ID
          <Controller
            control={control}
            name="nid"
            render={({ field }) => {
              return <Input {...field} placeholder="1 1989 8 0133256 7 89" />
            }}
          />
        </label>
        <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
          <p>
            Primary Phone <span className="text-red-500">*</span>
          </p>
          <Controller
            control={control}
            name="phone1"
            rules={{ required: 'Please add the primary phone number' }}
            render={({ field }) => {
              return <Input {...field} placeholder="0788 000 000" />
            }}
          />
          {errors.phone1 && (
            <span className="text-red-500 text-[12px]">
              {errors.phone1.message}
            </span>
          )}
        </label>
        <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
          Secondary phone
          <Controller
            control={control}
            name="phone2"
            render={({ field }) => {
              return <Input {...field} placeholder="0788 111 111" />
            }}
          />
        </label>
        <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col gap-2">
          <p>
            Amount <span className="text-red-500">*</span>
          </p>
          <Controller
            control={control}
            name="ubudehe"
            rules={{ required: 'Please add the ubudehe amount' }}
            render={({ field }) => {
              return <Input {...field} placeholder="5000" />
            }}
          />
          {errors.amount && (
            <span className="text-red-500 text-[12px]">
              {errors.amount.message}
            </span>
          )}
        </label>
        <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
          Household type
          <Controller
            control={control}
            name="type"
            defaultValue={1}
            render={({ field }) => {
              return (
                <select
                  {...field}
                  className="p-2 outline-none border-[1px] rounded-md w-[90%] border-primary focus:border-[1.5px] ease-in-out duration-150"
                >
                  <option disabled value="">
                    Select household type
                  </option>
                  <option value={1}>Residence</option>
                  <option value={2}>Business</option>
                </select>
              )
            }}
          />
        </label>
      </section>
      <section className="flex items-center gap-4 w-full flex-wrap">
        <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
          <p>
            Province <span className="text-red-500">*</span>
          </p>
          <Controller
            control={control}
            name="province"
            defaultValue={31}
            rules={{ required: 'Please select the province' }}
            render={({ field }) => {
              return (
                <select
                  {...field}
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                >
                  <option disabled value="">
                    Select province
                  </option>
                  <option value={31}>Kigali</option>
                </select>
              )
            }}
          />
          {errors.province && (
            <span className="text-red-500 text-[12px]">
              {errors.province.message}
            </span>
          )}
        </label>
        <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
          <p>
            District <span className="text-red-500">*</span>
          </p>
          <Controller
            control={control}
            name="district"
            defaultValue={districtId || selectedDistrict}
            rules={{ required: 'Please select the district' }}
            render={({ field }) => {
              return (
                <select
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    dispatch(setSelectedDistrict(e.target.value))
                  }}
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                >
                  <option disabled value="">
                    Select a district
                  </option>
                  {districts?.map((district) => {
                      if (districtId) {
                        return (
                          <option disabled={district.id !== districtId} key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        )
                      }
                      return (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      )
                  })}
                </select>
              )
            }}
          />
          {errors.district && (
            <span className="text-red-500 text-[12px]">
              {errors.district.message}
            </span>
          )}
        </label>
        <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
          <p>
            Sector <span className="text-red-500">*</span>
          </p>
          <Controller
            control={control}
            name="sector"
            defaultValue={sectorId || selectedSector}
            rules={{ required: 'Please select the sector' }}
            render={({ field }) => {
              return (
                <select
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    dispatch(setSelectedSector(e.target.value))
                  }}
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                >
                  <option disabled value="">
                    Select a sector
                  </option>
                  {sectors?.map((sector) => {
                    if (sectorId) {
                      return (
                        <option disabled = {sector.id !== sectorId} key={sector.id} value={sector.id}>
                          {sector.name || 'Sector'}
                        </option>
                      )
                    }
                    return (
                      <option key={sector.id} value={sector.id}>
                        {sector.name || 'Sector'}
                      </option>
                    )
                  })}
                </select>
              )
            }}
          />
          {errors.sector && (
            <span className="text-red-500 text-[12px]">
              {errors.sector.message}
            </span>
          )}
        </label>
        <label className="text-[15px] w-full flex-1 basis-[40%] flex flex-col items-start gap-2">
          <p>
            Cell <span className="text-red-500">*</span>
          </p>
          <Controller
            control={control}
            name="cell"
            defaultValue={cellId || selectedCell}
            defa
            rules={{ required: 'Please select the cell' }}
            render={({ field }) => {
              return (
                <select
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    dispatch(setSelectedCell(e.target.value))
                  }}
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                >
                  <option disabled value="">
                    Select a cell
                  </option>
                  {cells?.map((cell) => {
                    if (cellId) {
                      return (
                        <option disabled={cell.id !== cellId} key={cell.id} value={cell.id}>
                          {cell.name}
                        </option>
                      )
                    }
                    return (
                      <option key={cell.id} value={cell.id}>
                        {cell.name}
                      </option>
                    )
                  })}
                </select>
              )
            }}
          />
          {errors.cell && (
            <span className="text-red-500 text-[12px]">
              {errors.cell.message}
            </span>
          )}
        </label>
        <label className="text-[15px] w-full flex-1 basis-[40%] max-w-[48%] flex flex-col items-start gap-2">
          <p>
            Village <span className="text-red-500">*</span>
          </p>
          <Controller
            control={control}
            name="village"
            defaultValue={villageId || selectedVillage}
            rules={{ required: 'Please select the village' }}
            render={({ field }) => {
              return (
                <select
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    dispatch(setSelectedVillage(e.target.value))
                  }}
                  className="p-2 outline-none border-[1px] rounded-md border-primary w-[90%] focus:border-[1.5px] ease-in-out duration-150"
                >
                  <option disabled value="">
                    Select a village
                  </option>
                  {villages?.map((village) => {
                    if (villageId) {
                      return (
                        <option disabled={village.id !== villageId} key={village.id} value={village.id}>
                          {village.name}
                        </option>
                      )
                    }
                    return (
                      <option key={village.id} value={village.id}>
                        {village.name}
                      </option>
                    )
                  })}
                </select>
              )
            }}
          />
          {errors.village && (
            <span className="text-red-500 text-[12px]">
              {errors.village.message}
            </span>
          )}
        </label>
      </section>
      <section className={`${createHouseholdSuccess ? 'flex' : 'hidden'}`}>
        <p className={`${householdConflict ? 'text-red-500' : 'hidden'}`}>
          The current household already exists
        </p>
        <p className={`${!householdConflict ? 'text-green-500' : 'hidden'}`}>
          Household created successfully
        </p>
      </section>
      <Controller
        name="submit"
        control={control}
        render={({ field }) => {
          return (
            <Button
              submit
              {...field}
              value={
                createHouseholdLoading ? <Loading /> : 'Create Household'
              }
              className={`${!householdConflict ? 'flex' : 'hidden'} w-fit max-w-[50%] px-6 mx-auto`}
            />
          )
        }}
      />
      <Button value='Move household' className={`${householdConflict ? 'flex' : 'hidden'}`} onClick={(e) => {
        e.preventDefault()
        dispatch(setMoveHouseholdModal(true))
      }} />
    </form>
  </main>
  )
}

export default EditHousehold;

export default function useProjectRequestSectionNumber() {
  let sectionNumber = 0

  const getSectionNumber = () => {
    sectionNumber++
    return sectionNumber
  }

  return {
    getSectionNumber,
  }
}

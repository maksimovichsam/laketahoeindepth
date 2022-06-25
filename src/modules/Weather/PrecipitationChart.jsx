import TemperatureChart from "./TemperatureChart";

function PrecipitationChart(props) {
    const { data, time } = props;

    return (
        <TemperatureChart
            data={data}
            time={time}
            units={"%"}
            />

    )
}

export default PrecipitationChart;
import React from "react"
import { connect } from "react-redux"
import { Selector } from "../CommonElements"
import { getTranslate } from 'react-localize-redux';
import { changeSymbol } from "../../actions/marketActions"
import BLOCKCHAIN_INFO from "../../../../env"

@connect((store) => {
	return {
		selectedSymbol: store.market.configs.selectedSymbol,
		locale: store.locale,
		translate: getTranslate(store.locale)
	}
})


export default class TradingView extends React.Component {
	constructor() {
		super()
		this.state = {
			rateType: "",
		}
	}

	static defaultProps = {
		//	symbol: this.props.selectedSymbol,
		interval: '5',
		locale: 'en',
		containerId: 'tv_chart_container',
		datafeedUrl: BLOCKCHAIN_INFO.tracker + '/chart',
		updateFrequency: 50000, // 1 minutes
		libraryPath: '/trading_view/charting_library/',
		fullscreen: false,
		autosize: true
	};




	getLanguageFromURL = () => {
		// const regex = new RegExp('[\\?&]lang=([^&#]*)');
		// const results = regex.exec(window.location.search);
		// return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
		var locale = this.props.locale
		var defaultValue = 'en'
		if (Array.isArray(locale.languages) && locale.languages.length === 1) {
			var language = locale.languages[0]
			switch (language.code) {
				case 'en':
					defaultValue = 'en'
					break;
				case 'cn':
					defaultValue = 'zh'
					break;
				case 'kr':
					defaultValue = 'ko'
					break;
				case 'vi':
					defaultValue = 'vi'
					break;
				default:
					defaultValue = 'en'
			}
		}
		return defaultValue
	}

	createButton = (widget, data) => {
		const button = widget.createButton()
			.attr('title', data.title)
			.addClass('apply-common-tooltip')
			.on('click', () => {
				window.KyberRateType = data.value;
				this.setState({ rateType: data.value })
			});
		button[0].innerHTML = data.content;
	}

	getTimeFrame = (interval) => {
		switch(interval) {
			case '5':
				return 6 * 3600
				break 
			case '15':
				return 6 * 3 * 3600
				break 
			case '30':
				return 6 * 6 * 3600
				break 
			case '60':
				return 6 * 12 * 3600
				break 
			case '120':
				return 6 * 24 * 3600
				break 
			case '240':
				return 6 * 48 * 3600
				break 
			case '360':
				return 6 * 72 * 3600
				break 
			case '720':
				return 6 * 144 * 3600
				break 			
		}
		return '4D'
	}

	componentDidMount() {
		// console.log(this.props)
		const feeder = new window.Datafeeds.UDFCompatibleDatafeed(
			this.props.datafeedUrl, this.props.updateFrequency);

		
		const widgetOptions = {
			symbol: this.props.selectedSymbol,
			datafeed: feeder,
			interval: this.props.interval,
			container_id: this.props.containerId,
			library_path: this.props.libraryPath,			
			// timeframe: this.props.timeframe,
			// time_frames: this.props.time_frames,
			locale: this.getLanguageFromURL() || this.props.locale,
			fullscreen: this.props.fullscreen,
			autosize: this.props.autosize,
			timeframe: this.getTimeFrame(this.props.interval),
			// timezone: "Asia/Singapore",
			overrides: {
				'mainSeriesProperties.candleStyle.upColor': '#31CB9E',
				'mainSeriesProperties.candleStyle.downColor': '#F95555',
				'mainSeriesProperties.candleStyle.wickUpColor': '#31CB9E',
				'mainSeriesProperties.candleStyle.wickDownColor': '#F95555',
				'mainSeriesProperties.candleStyle.drawBorder': false,
			}
		};

		//	window.TradingView.onready(() => {
		const widget = window.tvWidget = new window.TradingView.widget(widgetOptions);

		widget.onChartReady(() => {
			// this.createButton(widget, { content: this.props.translate("trading_view.sell") || "Sell", value: "sell", title: this.props.translate("trading_view.sell_price") || "Sell price" })
			// this.createButton(widget, { content: this.props.translate("trading_view.buy") || "Buy", value: "buy", title: this.props.translate("trading_view.buy_price") || "Buy price" })
			// this.createButton(widget, { content: this.props.translate("trading_view.mid") || "Mid", value: "mid", title: this.props.translate("trading_view.mid_price") || "Mid price" })

			widget.activeChart().onSymbolChanged().subscribe(null, (symbolData) => {
				this.props.dispatch(changeSymbol(symbolData.name))
			})
			
			const chart = widget.chart();

			// chart.onIntervalChanged().subscribe(null, (interval, obj) => {
				
			// 	if (interval === "D") {
			// 		obj.timeframe = "100D"
			// 	} else if (interval === "W") {
			// 		obj.timeframe = "24M"
			// 	} else {
			// 		obj.timeframe = `${3600 / interval * 24}`;
			// 	}
			// });
		});
	}



	render() {
		// try {
		// 	if (window.tvWidget) {
		// 		const chart = window.tvWidget.chart();
		// 		const oldR = chart.resolution();
		// 		const newR = (oldR == "M") ? "W" : "M";

		// 		chart.setResolution(newR, function () {
		// 			chart.setResolution(oldR);
		// 		});
		// 	}
		// } catch (e) {
		// 	console.log(e)
		// }
		
		return (
			<div style={{ height: 600, padding: 20, marginTop: 10 }}
				id={this.props.containerId}
				className={'TVChartContainer'}
			/>
		)
	}
}

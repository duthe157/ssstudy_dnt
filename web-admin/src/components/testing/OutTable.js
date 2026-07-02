import React, { Component } from 'react';

export class OutTable extends Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        var heightWindow = window.innerHeight;
        return (
            <div style={{ height: heightWindow * (3.8/5), overflow: 'scroll' }}>
                <table className={this.props.tableClassName} border="1">
                    <tbody>
                        <tr style={{ borderTop: '1px', borderTopColor: '' }}>
                            <th></th>
                            {
                                this.props.columns.map((c) =>
                                    <th key={c.key} className={c.key === -1 ? this.props.tableHeaderRowClass : ""}>
                                        {c.key === -1 ? "" : c.name}
                                    </th>
                                )

                            }
                        </tr>
                        {
                            this.props.data.map((r, i) => (
                                <tr key={i}><td key={i} className={this.props.tableHeaderRowClass}>{i}</td>
                                    {
                                        this.props.columns.map(c => <td key={c.key}>{r[c.key]}</td>)
                                    }
                                </tr>
                            )
                            )
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}